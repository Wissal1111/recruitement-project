// repository/StudyApplicationRepository.java
package com.projet.recruitment_service.repository;

import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudyApplicationRepository extends JpaRepository<StudyApplication, UUID> {

    List<StudyApplication> findByStudyId(UUID studyId);

    List<StudyApplication> findByStudyIdAndStatus(UUID studyId, ApplicationStatus status);

    // RC-16: Duplicate check
    boolean existsByParticipantIdAndPhaseIdAndStatusNot(
            UUID participantId, UUID phaseId, ApplicationStatus status);

    Optional<StudyApplication> findByParticipantIdAndStudyIdAndStatus(
            UUID participantId, UUID studyId, ApplicationStatus status);
}
