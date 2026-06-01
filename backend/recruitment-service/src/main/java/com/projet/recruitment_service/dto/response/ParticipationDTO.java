// dto/response/ParticipationDTO.java
package com.projet.recruitment_service.dto.response;

import com.projet.recruitment_service.enums.ParticipationStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParticipationDTO {

    private UUID participationId;
    private UUID applicationId;
    private UUID participantId;

    // Enriched from StudyApplication
    private UUID studyId;
    private UUID phaseId;

    private ParticipationStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime droppedAt;
}