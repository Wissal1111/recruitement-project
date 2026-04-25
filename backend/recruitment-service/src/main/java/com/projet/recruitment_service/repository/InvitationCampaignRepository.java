// repository/InvitationCampaignRepository.java
package com.projet.recruitment_service.repository;

import com.projet.recruitment_service.entity.InvitationCampaign;
import com.projet.recruitment_service.enums.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InvitationCampaignRepository extends JpaRepository<InvitationCampaign, UUID> {
    List<InvitationCampaign> findByStudyId(UUID studyId);
    List<InvitationCampaign> findByStudyIdAndStatus(UUID studyId, CampaignStatus status);
}
