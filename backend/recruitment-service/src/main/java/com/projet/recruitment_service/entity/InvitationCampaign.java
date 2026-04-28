// entity/InvitationCampaign.java
package com.projet.recruitment_service.entity;

import com.projet.recruitment_service.enums.CampaignStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invitation_campaigns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvitationCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID campaignId;

    @Column(nullable = false)
    private UUID studyId;

    @Column(nullable = false)
    private UUID creatorId;

    private int targetCount;
    private int expirationDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status;

    private LocalDateTime launchedAt;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = CampaignStatus.DRAFT;
        if (expirationDays == 0) expirationDays = 7;
    }

    public void launch() {
        this.status = CampaignStatus.ACTIVE;
        this.launchedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = CampaignStatus.CANCELLED;
    }
}
