// entity/RewardTransaction.java
package com.projet.recruitment_service.entity;

import com.projet.recruitment_service.enums.RewardStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reward_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RewardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID transactionId;

    @Column(nullable = false)
    private UUID participationId;

    @Column(nullable = false)
    private UUID participantId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RewardStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = RewardStatus.PENDING;
    }

    public void process() {
        this.status = RewardStatus.PROCESSED;
        this.processedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = RewardStatus.CANCELLED;
    }
}
