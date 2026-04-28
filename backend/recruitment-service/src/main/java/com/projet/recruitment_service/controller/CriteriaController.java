// controller/CriteriaController.java
package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.dto.request.CriteriaRequest;
import com.projet.recruitment_service.entity.EligibilityCriteria;
import com.projet.recruitment_service.service.EligibilityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment/studies/{studyId}/criteria")
@RequiredArgsConstructor
public class CriteriaController {

    private final EligibilityService eligibilityService;

    @PostMapping
    public ResponseEntity<EligibilityCriteria> create(
            @PathVariable UUID studyId,
            @RequestBody CriteriaRequest request) {
        return ResponseEntity.status(201).body(eligibilityService.createCriteria(studyId, request));
    }

    @GetMapping
    public ResponseEntity<EligibilityCriteria> get(@PathVariable UUID studyId) {
        return ResponseEntity.ok(eligibilityService.getCriteria(studyId));
    }

    @PutMapping
    public ResponseEntity<EligibilityCriteria> update(
            @PathVariable UUID studyId,
            @RequestBody CriteriaRequest request) {
        return ResponseEntity.ok(eligibilityService.updateCriteria(studyId, request));
    }

    @GetMapping("/preview")
    public ResponseEntity<Map<String, Object>> preview(
            @PathVariable UUID studyId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(eligibilityService.previewEligiblePool(studyId, token));
    }
}
