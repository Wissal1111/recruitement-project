package com.projet.recruitment_service.dto.response;

import com.projet.recruitment_service.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ApplicationDto {
    private UUID applicationId;
    private UUID studyId;
    private UUID phaseId;
    private UUID invitationId;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;

    // enriched
    private String studyTitle;
    private String studyDescription;
    private String rewardAmount;
}