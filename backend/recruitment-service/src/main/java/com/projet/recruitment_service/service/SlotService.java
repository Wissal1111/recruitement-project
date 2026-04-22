// service/SlotService.java
package com.projet.recruitment_service.service;

import com.projet.recruitment_service.dto.request.SlotRequest;
import com.projet.recruitment_service.entity.RecruitmentSlot;
import com.projet.recruitment_service.enums.SlotStatus;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.RecruitmentSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final RecruitmentSlotRepository slotRepository;

    // RC-22: Create slot
    public RecruitmentSlot createSlot(UUID phaseId, UUID studyId, SlotRequest request) {
        slotRepository.findByPhaseId(phaseId).ifPresent(s -> {
            throw new BusinessException("Slot already exists for this phase", HttpStatus.CONFLICT);
        });

        RecruitmentSlot slot = RecruitmentSlot.builder()
                .phaseId(phaseId)
                .studyId(studyId)
                .totalSlots(request.getTotalSlots())
                .rewardAmount(request.getRewardAmount())
                .status(SlotStatus.OPEN)
                .build();

        return slotRepository.save(slot);
    }

    // RC-23: Get slot status
    public RecruitmentSlot getSlot(UUID phaseId) {
        return slotRepository.findByPhaseId(phaseId)
                .orElseThrow(() -> new BusinessException("Slot not found for phase", HttpStatus.NOT_FOUND));
    }
}
