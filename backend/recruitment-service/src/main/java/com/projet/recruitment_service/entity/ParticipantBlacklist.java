// entity/ParticipantBlacklist.java
package com.projet.recruitment_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "participant_blacklist",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"study_id", "participant_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParticipantBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID blacklistId;

    @Column(name = "study_id", nullable = false)
    private UUID studyId;

    @Column(name = "participant_id", nullable = false)
    private UUID participantId;

    @Column(nullable = false)
    private UUID creatorId;

    @Column(nullable = false)
    private String reason;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
