// repository/EligibilityCriteriaRepository.java
package com.projet.recruitment_service.repository;

import com.projet.recruitment_service.entity.EligibilityCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EligibilityCriteriaRepository extends JpaRepository<EligibilityCriteria, UUID> {
    Optional<EligibilityCriteria> findByStudyId(UUID studyId);
}
