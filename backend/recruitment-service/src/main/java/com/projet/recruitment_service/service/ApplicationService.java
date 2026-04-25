// service/ApplicationService.java
package com.projet.recruitment_service.service;

import com.projet.recruitment_service.dto.request.ApplicationRequest;
import com.projet.recruitment_service.dto.request.ReviewRequest;
import com.projet.recruitment_service.entity.RecruitmentSlot;
import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.enums.ApplicationStatus;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.ParticipantBlacklistRepository;
import com.projet.recruitment_service.repository.RecruitmentSlotRepository;
import com.projet.recruitment_service.repository.StudyApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final StudyApplicationRepository applicationRepository;
    private final ParticipantBlacklistRepository blacklistRepository;
    private final RecruitmentSlotRepository slotRepository;
    private final EligibilityService eligibilityService;

    // RC-10: Voluntary application (pull flow)
    @Transactional
    public StudyApplication apply(UUID participantId, ApplicationRequest request, String authToken) {
        UUID studyId = request.getStudyId();
        UUID phaseId = request.getPhaseId();

        // RC-17 check: Blacklist
        if (blacklistRepository.existsByStudyIdAndParticipantId(studyId, participantId)) {
            throw new BusinessException("You are blacklisted from this study", HttpStatus.FORBIDDEN);
        }

        // RC-16: Duplicate check
        boolean isDuplicate = applicationRepository
                .existsByParticipantIdAndPhaseIdAndStatusNot(
                        participantId, phaseId, ApplicationStatus.REJECTED);
        if (isDuplicate) {
            throw new BusinessException(
                    "You already have an active application for this phase", HttpStatus.CONFLICT);
        }

        // Check slot availability
        RecruitmentSlot slot = slotRepository.findByPhaseId(phaseId)
                .orElseThrow(() -> new BusinessException("Phase slots not configured", HttpStatus.BAD_REQUEST));

        if (!slot.hasAvailableSlot()) {
            throw new BusinessException("No available slots for this phase", HttpStatus.CONFLICT);
        }

        // RC-05: Eligibility check via User Service
        boolean eligible = eligibilityService.isUserEligible(participantId, studyId, authToken);
        if (!eligible) {
            throw new BusinessException(
                    "You do not meet the eligibility criteria for this study", HttpStatus.FORBIDDEN);
        }

        StudyApplication application = StudyApplication.builder()
                .participantId(participantId)
                .studyId(studyId)
                .phaseId(phaseId)
                .status(ApplicationStatus.PENDING)
                .build();

        return applicationRepository.save(application);
    }

    // RC-11: Get applications for a study
    public List<StudyApplication> getApplicationsByStudy(UUID studyId, ApplicationStatus status) {
        if (status != null) {
            return applicationRepository.findByStudyIdAndStatus(studyId, status);
        }
        return applicationRepository.findByStudyId(studyId);
    }

    // RC-12: Cancel application
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

    // RC-30: Manual review
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
