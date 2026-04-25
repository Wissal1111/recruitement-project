// entity/StudyApplication.java
package com.projet.recruitment_service.entity;

import com.projet.recruitment_service.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "study_applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudyApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID applicationId;

    @Column(nullable = false)
    private UUID participantId;

    @Column(nullable = false)
    private UUID studyId;

    @Column(nullable = false)
    private UUID phaseId;

    private UUID invitationId; // null if voluntary (pull)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
        if (status == null) status = ApplicationStatus.PENDING;
    }

    public void approve() {
        this.status = ApplicationStatus.APPROVED;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject(String reason) {
        this.status = ApplicationStatus.REJECTED;
        this.reviewedAt = LocalDateTime.now();
        this.rejectionReason = reason;
    }
}
