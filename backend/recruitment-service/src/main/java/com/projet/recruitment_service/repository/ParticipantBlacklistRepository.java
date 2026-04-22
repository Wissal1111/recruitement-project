// repository/ParticipantBlacklistRepository.java
package com.projet.recruitment_service.repository;

import com.projet.recruitment_service.entity.ParticipantBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParticipantBlacklistRepository extends JpaRepository<ParticipantBlacklist, UUID> {
    boolean existsByStudyIdAndParticipantId(UUID studyId, UUID participantId);
    List<ParticipantBlacklist> findByStudyId(UUID studyId);
    Optional<ParticipantBlacklist> findByStudyIdAndParticipantId(UUID studyId, UUID participantId);
}
