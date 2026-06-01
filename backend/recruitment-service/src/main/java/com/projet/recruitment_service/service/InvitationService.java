package com.projet.recruitment_service.service;

import com.projet.recruitment_service.client.SurveyServiceClient;
import com.projet.recruitment_service.dto.response.InvitationDto;
import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.enums.ApplicationStatus;
import com.projet.recruitment_service.enums.InvitationStatus;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.StudyApplicationRepository;
import com.projet.recruitment_service.repository.SurveyInvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationService {

    private final SurveyInvitationRepository invitationRepository;
    private final StudyApplicationRepository applicationRepository;
    private final SurveyServiceClient surveyServiceClient;

    public List<InvitationDto> getMyInvitations(UUID userId) {
        List<SurveyInvitation> invitations = invitationRepository.findByUserId(userId);

        return invitations.stream()
                .map(inv -> {
                    String title = null;
                    String budget = null;
                    String description = null;

                    try {
                        Map<String, Object> study = surveyServiceClient
                                .getStudyById(inv.getStudyId().toString());
                        if (study != null) {
                            title = (String) study.get("title");
                            description = (String) study.get("description");
                            Object raw = study.get("totalBudget");
if (raw instanceof Map<?, ?> rawMap) {
    Object decimal = rawMap.get("$numberDecimal");
    budget = decimal != null ? decimal.toString() : "";
} else if (raw != null) {
    budget = raw.toString();
}
                        }
                    } catch (Exception e) {
                        log.warn("Could not fetch study info for studyId={}: {}",
                                inv.getStudyId(), e.getMessage());
                    }

                    return InvitationDto.builder()
                            .invitationId(inv.getInvitationId())
                            .campaignId(inv.getCampaignId())
                            .studyId(inv.getStudyId())
                            .status(inv.getStatus())
                            .sentAt(inv.getSentAt())
                            .respondedAt(inv.getRespondedAt())
                            .expiresAt(inv.getExpiresAt())
                            .completedAt(inv.getCompletedAt())
                            .studyTitle(title)
                            .totalBudget(budget)
                            .studyDescription(description) 
                            .build();
                })
                .toList();
    }

    @Transactional
    public StudyApplication acceptInvitation(UUID invitationId, UUID userId) {
        SurveyInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new BusinessException("Invitation not found", HttpStatus.NOT_FOUND));

        if (!invitation.getUserId().equals(userId)) {
            throw new BusinessException("Access denied", HttpStatus.FORBIDDEN);
        }
        if (invitation.isExpired()) {
            invitation.expire();
            invitationRepository.save(invitation);
            throw new BusinessException("Invitation has expired", HttpStatus.GONE);
        }
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BusinessException(
                    "Invitation cannot be accepted. Current status: " + invitation.getStatus(),
                    HttpStatus.CONFLICT);
        }

        invitation.accept();
        invitationRepository.save(invitation);

        StudyApplication application = StudyApplication.builder()
                .participantId(userId)
                .studyId(invitation.getStudyId())
                .phaseId(UUID.randomUUID())
                .invitationId(invitationId)
                .status(ApplicationStatus.PENDING)
                .build();

        return applicationRepository.save(application);
    }

    @Transactional
    public SurveyInvitation declineInvitation(UUID invitationId, UUID userId) {
        SurveyInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new BusinessException("Invitation not found", HttpStatus.NOT_FOUND));

        if (!invitation.getUserId().equals(userId)) {
            throw new BusinessException("Access denied", HttpStatus.FORBIDDEN);
        }
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BusinessException("Invitation cannot be declined", HttpStatus.CONFLICT);
        }

        invitation.decline();
        return invitationRepository.save(invitation);
    }
}