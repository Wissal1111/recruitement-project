// service/CampaignService.java
package com.projet.recruitment_service.service;

import com.projet.recruitment_service.dto.request.CampaignRequest;
import com.projet.recruitment_service.dto.response.CampaignStatsResponse;
import com.projet.recruitment_service.dto.response.UserProfileDto;
import com.projet.recruitment_service.entity.*;
import com.projet.recruitment_service.enums.CampaignStatus;
import com.projet.recruitment_service.enums.InvitationStatus;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final InvitationCampaignRepository campaignRepository;
    private final SurveyInvitationRepository invitationRepository;
    private final EligibilityService eligibilityService;
    private final EligibilityCriteriaRepository criteriaRepository;

    // RC-06: Launch campaign
    @Transactional
    public InvitationCampaign launchCampaign(UUID studyId, UUID creatorId,
                                             CampaignRequest request, String authToken) {
        EligibilityCriteria criteria = criteriaRepository.findByStudyId(studyId)
                .orElseThrow(() -> new BusinessException(
                        "Define eligibility criteria before launching a campaign", HttpStatus.BAD_REQUEST));

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
            // Skip if user already has active/accepted/completed invitation for this study
            boolean alreadyInvited = invitationRepository.existsByUserIdAndStudyIdAndStatusIn(
                    user.getUserId(), studyId,
                    List.of(InvitationStatus.PENDING, InvitationStatus.ACCEPTED, InvitationStatus.COMPLETED));
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

    // RC-13: List campaigns for a study
    public List<InvitationCampaign> getCampaignsByStudy(UUID studyId) {
        return campaignRepository.findByStudyId(studyId);
    }

    // RC-14: Cancel campaign
    @Transactional
    public InvitationCampaign cancelCampaign(UUID campaignId) {
        InvitationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new BusinessException("Campaign not found", HttpStatus.NOT_FOUND));

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

        long totalAccepted = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.ACCEPTED);
        long totalCompleted = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.COMPLETED);
        long totalDeclined = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.DECLINED);
        long totalExpired = invitationRepository.countByCampaignIdAndStatus(campaignId, InvitationStatus.EXPIRED);

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
}
