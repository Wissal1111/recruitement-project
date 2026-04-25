// service/ParticipationService.java
package com.projet.recruitment_service.service;

import com.projet.recruitment_service.entity.*;
import com.projet.recruitment_service.enums.*;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final StudyApplicationRepository applicationRepository;
    private final RecruitmentSlotRepository slotRepository;
    private final RewardTransactionRepository rewardRepository;

    // RC-25: Start participation (when application APPROVED)
    @Transactional
    public Participation startParticipation(UUID applicationId) {
        StudyApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new BusinessException(
                    "Application must be APPROVED to start participation", HttpStatus.CONFLICT);
        }

        // Decrement slot
        RecruitmentSlot slot = slotRepository.findByPhaseId(application.getPhaseId())
                .orElseThrow(() -> new BusinessException("Slot not found", HttpStatus.NOT_FOUND));
        slot.incrementFilled();
        slotRepository.save(slot);

        Participation participation = Participation.builder()
                .applicationId(applicationId)
                .participantId(application.getParticipantId())
                .phaseId(application.getPhaseId())
                .status(ParticipationStatus.ACTIVE)
                .build();

        return participationRepository.save(participation);
    }

    // RC-26: Complete participation → create reward
    @Transactional
    public Participation completeParticipation(UUID participationId, UUID participantId) {
        Participation participation = getOwnedParticipation(participationId, participantId);

        if (participation.getStatus() != ParticipationStatus.ACTIVE) {
            throw new BusinessException("Participation is not ACTIVE", HttpStatus.CONFLICT);
        }

        participation.complete();
        participationRepository.save(participation);

        // Create reward transaction
        RecruitmentSlot slot = slotRepository.findByPhaseId(participation.getPhaseId())
                .orElseThrow(() -> new BusinessException("Slot not found", HttpStatus.NOT_FOUND));

        RewardTransaction reward = RewardTransaction.builder()
                .participationId(participationId)
                .participantId(participantId)
                .amount(slot.getRewardAmount())
                .status(RewardStatus.PENDING)
                .build();
        rewardRepository.save(reward);

        // TODO: publish PARTICIPATION_COMPLETED event to Payment Service

        return participation;
    }

    // RC-27: Drop or disqualify
    @Transactional
    public Participation updateParticipationStatus(UUID participationId,
                                                   UUID participantId,
                                                   ParticipationStatus newStatus) {
        Participation participation = getOwnedParticipation(participationId, participantId);

        if (participation.getStatus() != ParticipationStatus.ACTIVE) {
            throw new BusinessException("Participation is not ACTIVE", HttpStatus.CONFLICT);
        }

        if (newStatus == ParticipationStatus.DROPPED) {
            participation.drop();
        } else if (newStatus == ParticipationStatus.DISQUALIFIED) {
            participation.disqualify();
        } else {
            throw new BusinessException("Invalid status transition", HttpStatus.BAD_REQUEST);
        }

        // Release slot
        slotRepository.findByPhaseId(participation.getPhaseId())
                .ifPresent(slot -> {
                    slot.decrementFilled();
                    slotRepository.save(slot);
                });

        return participationRepository.save(participation);
    }

    // RC-28: Get my participations
    public List<Participation> getMyParticipations(UUID participantId) {
        return participationRepository.findByParticipantId(participantId);
    }

    // RC-29: List participants of a phase
    public List<Participation> getPhaseParticipants(UUID phaseId) {
        return participationRepository.findByPhaseId(phaseId);
    }

    private Participation getOwnedParticipation(UUID participationId, UUID participantId) {
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new BusinessException("Participation not found", HttpStatus.NOT_FOUND));
        if (!participation.getParticipantId().equals(participantId)) {
            throw new BusinessException("Access denied", HttpStatus.FORBIDDEN);
        }
        return participation;
    }
}
