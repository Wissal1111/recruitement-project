// repository/RecruitmentSlotRepository.java
package com.projet.recruitment_service.repository;

import com.projet.recruitment_service.entity.RecruitmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface RecruitmentSlotRepository extends JpaRepository<RecruitmentSlot, UUID> {
    Optional<RecruitmentSlot> findByPhaseId(UUID phaseId);
    Optional<RecruitmentSlot> findByPhaseIdAndStudyId(UUID phaseId, UUID studyId);
    //utilisée par CampaignService.calculateTotalPoints
    List<RecruitmentSlot> findByStudyId(UUID studyId);
}
