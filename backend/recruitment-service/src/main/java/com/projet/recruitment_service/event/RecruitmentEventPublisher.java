package com.projet.recruitment_service.event;

import com.projet.recruitment_service.entity.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RecruitmentEventPublisher {

    public void publishInvitationSent(SurveyInvitation inv) {
        log.info("EVENT invitation.sent — userId: {} studyId: {}",
                inv.getUserId(), inv.getStudyId());
    }

    public void publishInvitationExpired(SurveyInvitation inv) {
        log.info("EVENT invitation.expired — invitationId: {}",
                inv.getInvitationId());
    }

    public void publishApplicationApproved(StudyApplication app) {
        log.info("EVENT application.approved — applicationId: {} participantId: {}",
                app.getApplicationId(), app.getParticipantId());
    }

    public void publishApplicationRejected(StudyApplication app) {
        log.info("EVENT application.rejected — applicationId: {} reason: {}",
                app.getApplicationId(), app.getRejectionReason());
    }

    public void publishParticipationCompleted(Participation part, RewardTransaction tx) {
        log.info("EVENT participation.completed — participationId: {} amount: {}",
                part.getParticipationId(), tx.getAmount());
    }
}