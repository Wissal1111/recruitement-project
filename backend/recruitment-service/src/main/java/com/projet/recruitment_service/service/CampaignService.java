package com.projet.recruitment_service.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projet.recruitment_service.client.PaymentServiceClient;
import com.projet.recruitment_service.dto.request.CampaignRequest;
import com.projet.recruitment_service.dto.response.CampaignStatsResponse;
import com.projet.recruitment_service.dto.response.UserProfileDto;
import com.projet.recruitment_service.entity.EligibilityCriteria;
import com.projet.recruitment_service.entity.InvitationCampaign;
import com.projet.recruitment_service.entity.RecruitmentSlot;
import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.enums.CampaignStatus;
import com.projet.recruitment_service.enums.InvitationStatus;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.EligibilityCriteriaRepository;
import com.projet.recruitment_service.repository.InvitationCampaignRepository;
import com.projet.recruitment_service.repository.RecruitmentSlotRepository;
import com.projet.recruitment_service.repository.SurveyInvitationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignService {

    private final InvitationCampaignRepository campaignRepository;
    private final SurveyInvitationRepository invitationRepository;
    private final EligibilityService eligibilityService;
    private final EligibilityCriteriaRepository criteriaRepository;
    private final PaymentServiceClient paymentServiceClient;
    private final RecruitmentSlotRepository slotRepository;

    // RC-06: Launch campaign → ALLOUER les points
    @Transactional
    public InvitationCampaign launchCampaign(UUID studyId, UUID creatorId,
                                             CampaignRequest request, String authToken) {

        // Allow no criteria → means "everyone is eligible"
        EligibilityCriteria criteria = criteriaRepository
                .findByStudyId(studyId)
                .orElse(null);

        // Calculate total budget and allocate points via payment-service
        BigDecimal totalPoints = calculateTotalPoints(studyId, request.getTargetCount());

        try {
            String serviceToken = "Bearer " + System.getenv("SERVICE_SECRET");

            Map<String, Object> allocationResponse = paymentServiceClient.allocatePoints(
                    serviceToken,
                    Map.of(
                            "creatorId", creatorId.toString(),
                            "studyId", studyId.toString(),
                            "totalPoints", totalPoints.toString()
                    )
            );

            log.info("Points allocated for study {}: {}", studyId, allocationResponse);

        } catch (Exception e) {
            log.error("Failed to allocate points: {}", e.getMessage());
            throw new BusinessException(
                    "Insufficient wallet points to launch campaign. Please purchase more points.",
                    HttpStatus.PAYMENT_REQUIRED);
        }

        // Fetch eligible users from User Service
        List<UserProfileDto> eligibleUsers = eligibilityService.fetchEligibleUsers(criteria, authToken);

        // Create the campaign
        InvitationCampaign campaign = InvitationCampaign.builder()
                .studyId(studyId)
                .creatorId(creatorId)
                .targetCount(request.getTargetCount())
                .expirationDays(request.getExpirationDays())
                .status(CampaignStatus.ACTIVE)
                .build();
        campaign.launch();
        campaign = campaignRepository.save(campaign);

        // RC-15: Create invitations, skip duplicates
        final UUID campaignId = campaign.getCampaignId();
        final int expDays = campaign.getExpirationDays();

        for (UserProfileDto user : eligibleUsers) {
            boolean alreadyInvited = invitationRepository.existsByUserIdAndStudyIdAndStatusIn(
                    user.getUserId(), studyId,
                    List.of(InvitationStatus.PENDING, InvitationStatus.ACCEPTED,
                            InvitationStatus.COMPLETED));
            if (alreadyInvited) continue;

            SurveyInvitation invitation = SurveyInvitation.builder()
                    .campaignId(campaignId)
                    .userId(user.getUserId())
                    .studyId(studyId)
                    .status(InvitationStatus.PENDING)
                    .expiresAt(LocalDateTime.now().plusDays(expDays))
                    .build();
            invitationRepository.save(invitation);
        }

        return campaign;
    }

    // Calculate total budget: rewardAmount × targetCount across all slots
    private BigDecimal calculateTotalPoints(UUID studyId, int targetCount) {
        List<RecruitmentSlot> slots = slotRepository.findByStudyId(studyId);

        if (slots.isEmpty()) {
            log.warn("No slots found for study {}, using default", studyId);
            return BigDecimal.ZERO;
        }

        return slots.stream()
                .map(slot -> slot.getRewardAmount().multiply(BigDecimal.valueOf(targetCount)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // RC-13: List campaigns for a study
    public List<InvitationCampaign> getCampaignsByStudy(UUID studyId) {
        return campaignRepository.findByStudyId(studyId);
    }

    // RC-14: Cancel campaign → LIBÉRER les points
    @Transactional
    public InvitationCampaign cancelCampaign(UUID campaignId) {
        InvitationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new BusinessException("Campaign not found", HttpStatus.NOT_FOUND));

        // Release allocated points
        try {
            String serviceToken = "Bearer " + System.getenv("SERVICE_SECRET");

            BigDecimal totalPoints = calculateTotalPoints(
                    campaign.getStudyId(),
                    campaign.getTargetCount());

            paymentServiceClient.releasePoints(
                    serviceToken,
                    Map.of(
                            "creatorId", campaign.getCreatorId().toString(),
                            "studyId", campaign.getStudyId().toString(),
                            "totalPoints", totalPoints.toString()
                    )
            );

            log.info("Points released for cancelled campaign {}", campaignId);

        } catch (Exception e) {
            log.error("Failed to release points for campaign {}: {}", campaignId, e.getMessage());
            // Don't block cancellation if payment release fails
        }

        campaign.cancel();
        campaignRepository.save(campaign);

        // Cancel all PENDING invitations
        List<SurveyInvitation> pending = invitationRepository
                .findByCampaignIdAndStatusIn(campaignId, List.of(InvitationStatus.PENDING));
        pending.forEach(inv -> inv.setStatus(InvitationStatus.CANCELLED));
        invitationRepository.saveAll(pending);

        return campaign;
    }

    // RC-21: Update expiration days
    @Transactional
    public InvitationCampaign updateExpiration(UUID campaignId, int expirationDays) {
        InvitationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new BusinessException("Campaign not found", HttpStatus.NOT_FOUND));

        campaign.setExpirationDays(expirationDays);
        campaignRepository.save(campaign);

        // Recalculate expiresAt for all PENDING invitations
        List<SurveyInvitation> pending = invitationRepository
                .findByCampaignIdAndStatusIn(campaignId, List.of(InvitationStatus.PENDING));
        LocalDateTime newExpiry = LocalDateTime.now().plusDays(expirationDays);
        pending.forEach(inv -> inv.setExpiresAt(newExpiry));
        invitationRepository.saveAll(pending);

        return campaign;
    }

    // RC-24: Resend expired/declined invitations
    @Transactional
    public int resendInvitations(UUID campaignId) {
        InvitationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new BusinessException("Campaign not found", HttpStatus.NOT_FOUND));

        List<SurveyInvitation> toResend = invitationRepository
                .findByCampaignIdAndStatusIn(campaignId,
                        List.of(InvitationStatus.EXPIRED, InvitationStatus.DECLINED));

        LocalDateTime newExpiry = LocalDateTime.now().plusDays(campaign.getExpirationDays());
        toResend.forEach(inv -> {
            inv.setStatus(InvitationStatus.PENDING);
            inv.setExpiresAt(newExpiry);
            inv.setSentAt(LocalDateTime.now());
        });
        invitationRepository.saveAll(toResend);

        return toResend.size();
    }

    // RC-31: Campaign stats
    public CampaignStatsResponse getCampaignStats(UUID campaignId) {
        long totalInvited = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.PENDING)
                + invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.ACCEPTED)
                + invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.COMPLETED)
                + invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.DECLINED)
                + invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.EXPIRED);

        long totalAccepted  = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.ACCEPTED);
        long totalCompleted = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.COMPLETED);
        long totalDeclined  = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.DECLINED);
        long totalExpired   = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.EXPIRED);

        double conversionRate = totalInvited > 0
                ? (double) totalCompleted / totalInvited * 100
                : 0;

        return CampaignStatsResponse.builder()
                .totalInvited(totalInvited)
                .totalAccepted(totalAccepted)
                .totalCompleted(totalCompleted)
                .totalDeclined(totalDeclined)
                .totalExpired(totalExpired)
                .conversionRate(conversionRate)
                .build();
    }

    @Transactional
    public SurveyInvitation inviteSpecificUser(UUID studyId, UUID creatorId, UUID targetUserId, String authToken) {
        boolean alreadyInvited = invitationRepository.existsByUserIdAndStudyIdAndStatusIn(
                targetUserId, studyId,
                List.of(InvitationStatus.PENDING, InvitationStatus.ACCEPTED,
                        InvitationStatus.COMPLETED));
        if (alreadyInvited) {
            throw new BusinessException("User already invited to this study", HttpStatus.CONFLICT);
        }

        // campaign_id is NOT NULL in DB — create a single-user campaign first
        InvitationCampaign campaign = InvitationCampaign.builder()
                .studyId(studyId)
                .creatorId(creatorId)
                .targetCount(1)
                .expirationDays(7)
                .status(CampaignStatus.ACTIVE)
                .build();
        campaign.launch();
        campaign = campaignRepository.save(campaign);

        SurveyInvitation invitation = SurveyInvitation.builder()
                .campaignId(campaign.getCampaignId())
                .userId(targetUserId)
                .studyId(studyId)
                .status(InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        return invitationRepository.save(invitation);
    }
}