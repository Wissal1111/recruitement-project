package com.projet.recruitment_service.event;

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
public class ExpirationScheduler {

    private final SurveyInvitationRepository invitationRepo;
    private final RecruitmentEventPublisher publisher;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireInvitations() {
        List<SurveyInvitation> expired = invitationRepo
                .findByStatusAndExpiresAtBefore(
                        InvitationStatus.PENDING,
                        LocalDateTime.now());

        if (expired.isEmpty()) return;

        log.info("Expiration de {} invitations", expired.size());
        expired.forEach(inv -> {
            inv.expire();
            invitationRepo.save(inv);
            publisher.publishInvitationExpired(inv);
        });
    }
}