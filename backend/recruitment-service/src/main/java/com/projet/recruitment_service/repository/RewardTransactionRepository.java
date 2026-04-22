// repository/RewardTransactionRepository.java
package com.projet.recruitment_service.repository;

import com.projet.recruitment_service.entity.RewardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, UUID> {
    List<RewardTransaction> findByParticipantId(UUID participantId);
    List<RewardTransaction> findByParticipationId(UUID participationId);
}
