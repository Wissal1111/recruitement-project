package com.projet.recruitment_service.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.enums.InvitationStatus;

public interface SurveyInvitationRepository extends JpaRepository<SurveyInvitation, UUID> {

    List<SurveyInvitation> findByUserId(UUID userId);

    List<SurveyInvitation> findByCampaignId(UUID campaignId);

    List<SurveyInvitation> findByStudyId(UUID studyId);

    Optional<SurveyInvitation> findByUserIdAndStudyId(UUID userId, UUID studyId);

    boolean existsByUserIdAndStudyIdAndStatusIn(UUID userId, UUID studyId, List<InvitationStatus> statuses);

    List<SurveyInvitation> findByStatusAndExpiresAtBefore(
            InvitationStatus status, LocalDateTime now);

    @Query("SELECT COUNT(i) FROM SurveyInvitation i WHERE i.campaignId = :campaignId AND i.status = :status")
    long countByCampaignIdAndStatus(UUID campaignId, InvitationStatus status);

    List<SurveyInvitation> findByCampaignIdAndStatusIn(UUID campaignId, List<InvitationStatus> statuses);
}