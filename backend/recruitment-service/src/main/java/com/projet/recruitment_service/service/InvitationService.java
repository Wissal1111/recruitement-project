// service/InvitationService.java
package com.projet.recruitment_service.service;

import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.enums.ApplicationStatus;
import com.projet.recruitment_service.enums.InvitationStatus;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.StudyApplicationRepository;
import com.projet.recruitment_service.repository.SurveyInvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final SurveyInvitationRepository invitationRepository;
    private final StudyApplicationRepository applicationRepository;

    // RC-07: Get my invitations
    public List<SurveyInvitation> getMyInvitations(UUID userId) {
        return invitationRepository.findByUserId(userId);
    }

    // RC-08: Accept invitation → creates StudyApplication
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

        // Auto-create StudyApplication in PENDING
        StudyApplication application = StudyApplication.builder()
                .participantId(userId)
                .studyId(invitation.getStudyId())
                .phaseId(UUID.randomUUID()) // In real case: fetch first phase from survey service
                .invitationId(invitationId)
                .status(ApplicationStatus.PENDING)
                .build();

        return applicationRepository.save(application);
    }

    // RC-09: Decline invitation
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
