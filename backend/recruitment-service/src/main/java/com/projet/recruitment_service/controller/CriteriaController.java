// controller/CriteriaController.java
package com.projet.recruitment_service.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projet.recruitment_service.dto.request.CriteriaRequest;
import com.projet.recruitment_service.dto.response.UserProfileDto;
import com.projet.recruitment_service.entity.EligibilityCriteria;
import com.projet.recruitment_service.service.EligibilityService;

import lombok.RequiredArgsConstructor;

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

    @GetMapping("/eligible-users")
    public ResponseEntity<List<UserProfileDto>> getEligibleUsers(
            @PathVariable UUID studyId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        EligibilityCriteria criteria = eligibilityService.getCriteria(studyId);
        List<UserProfileDto> users = eligibilityService.fetchEligibleUsers(criteria, token);
        return ResponseEntity.ok(users);
    }
}
