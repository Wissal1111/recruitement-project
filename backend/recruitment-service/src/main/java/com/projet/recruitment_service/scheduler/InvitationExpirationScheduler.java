// scheduler/InvitationExpirationScheduler.java
package com.projet.recruitment_service.scheduler;

import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.enums.InvitationStatus;
import com.projet.recruitment_service.repository.SurveyInvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvitationExpirationScheduler {

    private final SurveyInvitationRepository invitationRepository;

    // Runs every hour
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireInvitations() {
        List<SurveyInvitation> expired = invitationRepository
                .findByStatusAndExpiresAtBefore(InvitationStatus.PENDING, LocalDateTime.now());

        if (expired.isEmpty()) return;

        log.info("Expiring {} invitations", expired.size());
        expired.forEach(SurveyInvitation::expire);
        invitationRepository.saveAll(expired);

        log.info("Published INVITATION_EXPIRED for {} invitations", expired.size());
    }
}
