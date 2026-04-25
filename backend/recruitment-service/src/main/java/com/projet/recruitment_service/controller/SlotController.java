// controller/SlotController.java
package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.dto.request.SlotRequest;
import com.projet.recruitment_service.entity.RecruitmentSlot;
import com.projet.recruitment_service.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment/phases/{phaseId}/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    // RC-22
    @PostMapping
    public ResponseEntity<RecruitmentSlot> create(
            @PathVariable UUID phaseId,
            @RequestParam UUID studyId,
            @RequestBody SlotRequest request) {
        return ResponseEntity.status(201).body(slotService.createSlot(phaseId, studyId, request));
    }

    // RC-23
    @GetMapping
    public ResponseEntity<RecruitmentSlot> get(@PathVariable UUID phaseId) {
        return ResponseEntity.ok(slotService.getSlot(phaseId));
    }
}
