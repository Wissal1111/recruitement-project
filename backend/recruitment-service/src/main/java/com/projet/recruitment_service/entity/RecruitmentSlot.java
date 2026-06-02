// entity/RecruitmentSlot.java
package com.projet.recruitment_service.entity;

import com.projet.recruitment_service.enums.SlotStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "recruitment_slots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecruitmentSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID slotId;

    @Column(nullable = false)
    private UUID phaseId;

    @Column(nullable = false)
    private UUID studyId;

    @Column(nullable = false)
    private int totalSlots;

    @Column(nullable = false)
    @Builder.Default
    private int filledSlots = 0;

    @Column(nullable = false)
    private BigDecimal rewardAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = SlotStatus.OPEN;
    }

    public boolean hasAvailableSlot() {
        return status == SlotStatus.OPEN && filledSlots < totalSlots;
    }

    public void incrementFilled() {
        this.filledSlots++;
        if (this.filledSlots >= this.totalSlots) {
            this.status = SlotStatus.FULL;
        }
    }

    public void decrementFilled() {
        if (this.filledSlots > 0) {
            this.filledSlots--;
            if (this.status == SlotStatus.FULL) {
                this.status = SlotStatus.OPEN;
            }
        }
    }
}
