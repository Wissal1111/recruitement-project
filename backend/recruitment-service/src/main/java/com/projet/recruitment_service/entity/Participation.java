// entity/Participation.java
package com.projet.recruitment_service.entity;

import com.projet.recruitment_service.enums.ParticipationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "participations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID participationId;

    @Column(nullable = false)
    private UUID applicationId;

    @Column(nullable = false)
    private UUID participantId;

    @Column(nullable = false)
    private UUID phaseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipationStatus status;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime droppedAt;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        if (status == null) status = ParticipationStatus.ACTIVE;
    }

    public void complete() {
        this.status = ParticipationStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void drop() {
        this.status = ParticipationStatus.DROPPED;
        this.droppedAt = LocalDateTime.now();
    }

    public void disqualify() {
        this.status = ParticipationStatus.DISQUALIFIED;
        this.droppedAt = LocalDateTime.now();
    }
}
