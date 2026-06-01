package com.projet.recruitment_service.dto.response;

import com.projet.recruitment_service.enums.InvitationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class InvitationDto {
    private UUID invitationId;
    private UUID campaignId;
    private UUID studyId;
    private InvitationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime completedAt;

    // enriched from survey-service
    private String studyTitle;
    private String totalBudget;
    private String studyDescription;
}