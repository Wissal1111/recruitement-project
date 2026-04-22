// repository/ParticipationRepository.java
package com.projet.recruitment_service.repository;

import com.projet.recruitment_service.entity.Participation;
import com.projet.recruitment_service.enums.ParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ParticipationRepository extends JpaRepository<Participation, UUID> {
    List<Participation> findByParticipantId(UUID participantId);
    List<Participation> findByPhaseId(UUID phaseId);
    List<Participation> findByPhaseIdAndStatus(UUID phaseId, ParticipationStatus status);
}
