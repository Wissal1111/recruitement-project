// controller/ApplicationController.java
package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.dto.request.ApplicationRequest;
import com.projet.recruitment_service.dto.request.ReviewRequest;
import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.enums.ApplicationStatus;
import com.projet.recruitment_service.service.ApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // RC-10: Voluntary apply
    @PostMapping("/api/recruitment/apply")
    public ResponseEntity<StudyApplication> apply(
            @RequestBody ApplicationRequest request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        UUID participantId = (UUID) httpRequest.getAttribute("userId");
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.status(201)
                .body(applicationService.apply(participantId, request, token));
    }

    // RC-11: Get applications
    @GetMapping("/api/recruitment/studies/{studyId}/applications")
    public ResponseEntity<List<StudyApplication>> list(
            @PathVariable UUID studyId,
            @RequestParam(required = false) ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.getApplicationsByStudy(studyId, status));
    }

    // RC-12: Cancel application
    @DeleteMapping("/api/recruitment/applications/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID participantId = (UUID) request.getAttribute("userId");
        applicationService.cancelApplication(id, participantId);
        return ResponseEntity.noContent().build();
    }

    // RC-30: Manual screening review
    @PutMapping("/api/recruitment/screening/{applicationId}/review")
    public ResponseEntity<StudyApplication> review(
            @PathVariable UUID applicationId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(applicationService.reviewApplication(applicationId, request));
    }
}
