// entity/EligibilityCriteria.java
package com.projet.recruitment_service.entity;

import com.projet.recruitment_service.enums.EducationLevel;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "eligibility_criteria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EligibilityCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID criteriaId;

    @Column(nullable = false)
    private UUID studyId;

    private Integer ageMin;
    private Integer ageMax;
    private String gender;
    private String country;

    @Enumerated(EnumType.STRING)
    private EducationLevel educationLevel;

    @ElementCollection
    @CollectionTable(name = "criteria_interest_ids",
            joinColumns = @JoinColumn(name = "criteria_id"))
    @Column(name = "interest_id")
    private List<UUID> interestIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
