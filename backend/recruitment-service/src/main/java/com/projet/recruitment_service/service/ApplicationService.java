package com.projet.recruitment_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projet.recruitment_service.client.SurveyServiceClient;
import com.projet.recruitment_service.dto.request.ApplicationRequest;
import com.projet.recruitment_service.dto.request.ReviewRequest;
import com.projet.recruitment_service.dto.response.PhaseInfoDto;
import com.projet.recruitment_service.entity.RecruitmentSlot;
import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.enums.ApplicationStatus;
import com.projet.recruitment_service.enums.ParticipationStatus;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.ParticipantBlacklistRepository;
import com.projet.recruitment_service.repository.ParticipationRepository;
import com.projet.recruitment_service.repository.RecruitmentSlotRepository;
import com.projet.recruitment_service.repository.StudyApplicationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final StudyApplicationRepository applicationRepository;
    private final ParticipantBlacklistRepository blacklistRepository;
    private final RecruitmentSlotRepository slotRepository;
    private final ParticipationRepository participationRepository;
    private final EligibilityService eligibilityService;
    private final SurveyServiceClient surveyServiceClient;

    @Transactional
    public StudyApplication apply(UUID participantId, ApplicationRequest request, String authToken) {
        UUID studyId = request.getStudyId();
        UUID phaseId = request.getPhaseId();

        // 1. Blacklist check
        if (blacklistRepository.existsByStudyIdAndParticipantId(studyId, participantId)) {
            throw new BusinessException("Vous êtes blacklisté de cette étude", HttpStatus.FORBIDDEN);
        }

        // 2. Duplicate check
        if (applicationRepository.existsByParticipantIdAndPhaseIdAndStatusNot(
                participantId, phaseId, ApplicationStatus.REJECTED)) {
            throw new BusinessException(
                    "Candidature déjà existante pour cette phase", HttpStatus.CONFLICT);
        }

        // 3. Slot check — auto-create if missing (study is published so slots are
        // valid)
        // REPLACE the orElseGet block with this:
        RecruitmentSlot slot = slotRepository.findByPhaseId(phaseId)
                .orElseGet(() -> {
                    try {
                        PhaseInfoDto phaseInfo = surveyServiceClient.getPhaseInfo(authToken, phaseId.toString());
                        int maxParticipants = phaseInfo.getMaxParticipants() != null
                                ? phaseInfo.getMaxParticipants()
                                : 10;
                        // ✅ Get rewardAmount, default to 0 if null
                        java.math.BigDecimal rewardAmount = phaseInfo.getRewardAmount() != null
                                ? phaseInfo.getRewardAmount()
                                : java.math.BigDecimal.ZERO;

                        RecruitmentSlot newSlot = RecruitmentSlot.builder()
                                .phaseId(phaseId)
                                .studyId(studyId) // ✅ Add studyId
                                .totalSlots(maxParticipants)
                                .filledSlots(0)
                                .rewardAmount(rewardAmount) // ✅ Add rewardAmount
                                .status(com.projet.recruitment_service.enums.SlotStatus.OPEN) // ✅ Add status
                                .build();
                        return slotRepository.save(newSlot);
                    } catch (Exception e) {
                        log.warn("Could not auto-create slot: {}", e.getMessage());
                        // ✅ Safe defaults for all NOT NULL columns
                        RecruitmentSlot newSlot = RecruitmentSlot.builder()
                                .phaseId(phaseId)
                                .studyId(studyId)
                                .totalSlots(10)
                                .filledSlots(0)
                                .rewardAmount(java.math.BigDecimal.ZERO) // ✅ Default 0
                                .status(com.projet.recruitment_service.enums.SlotStatus.OPEN)
                                .build();
                        return slotRepository.save(newSlot);
                    }
                });

        // 4. Vérification ordre des phases via survey-service
        try {
            PhaseInfoDto phaseInfo = surveyServiceClient.getPhaseInfo(authToken, phaseId.toString());

            if (Boolean.TRUE.equals(phaseInfo.getIsMultiPhase())
                    && phaseInfo.getPhaseOrder() != null
                    && phaseInfo.getPhaseOrder() > 1
                    && phaseInfo.getPreviousPhaseId() != null) {

                boolean previousCompleted = participationRepository
                        .existsByParticipantIdAndPhaseIdAndStatus(
                                participantId,
                                phaseInfo.getPreviousPhaseId(),
                                ParticipationStatus.COMPLETED);

                if (!previousCompleted) {
                    throw new BusinessException(
                            "Vous devez compléter la phase "
                                    + (phaseInfo.getPhaseOrder() - 1)
                                    + " avant de postuler à cette phase",
                            HttpStatus.FORBIDDEN);
                }
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Survey-service indisponible, vérification phase ignorée: {}", e.getMessage());
        }

        // 5. Eligibility check
        boolean eligible = eligibilityService.isUserEligible(participantId, studyId, authToken);
        if (!eligible) {
            throw new BusinessException(
                    "Vous ne satisfaites pas les critères d'éligibilité", HttpStatus.FORBIDDEN);
        }

        // 6. Créer candidature
        StudyApplication application = StudyApplication.builder()
                .participantId(participantId)
                .studyId(studyId)
                .phaseId(phaseId)
                .status(ApplicationStatus.PENDING)
                .build();

        return applicationRepository.save(application);
    }

    public List<StudyApplication> getApplicationsByStudy(UUID studyId, ApplicationStatus status) {
        if (status != null) {
            return applicationRepository.findByStudyIdAndStatus(studyId, status);
        }
        return applicationRepository.findByStudyId(studyId);
    }

    @Transactional
    public void cancelApplication(UUID applicationId, UUID participantId) {
        StudyApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found", HttpStatus.NOT_FOUND));

        if (!application.getParticipantId().equals(participantId)) {
            throw new BusinessException("Access denied", HttpStatus.FORBIDDEN);
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BusinessException(
                    "Only PENDING applications can be cancelled", HttpStatus.CONFLICT);
        }

        applicationRepository.delete(application);
    }

    @Transactional
    public StudyApplication reviewApplication(UUID applicationId, ReviewRequest request) {
        StudyApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException("Application not found", HttpStatus.NOT_FOUND));

        if (request.isApproved()) {
            application.approve();
        } else {
            application.reject(request.getRejectionReason());
        }

        return applicationRepository.save(application);
    }
}