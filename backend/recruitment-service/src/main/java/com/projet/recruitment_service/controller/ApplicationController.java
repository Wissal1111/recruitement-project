package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.dto.request.ApplicationRequest;
import com.projet.recruitment_service.dto.request.ReviewRequest;
import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.enums.ApplicationStatus;
import com.projet.recruitment_service.service.ApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;        // ← was missing
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/api/recruitment/apply")
    public ResponseEntity<?> apply(
            @RequestBody @Valid ApplicationRequest request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        UUID participantId = (UUID) httpRequest.getAttribute("userId");

        if (participantId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized: missing user identity"));
        }

        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.apply(participantId, request, token));
    }

    @GetMapping("/api/recruitment/studies/{studyId}/applications")
    public ResponseEntity<List<StudyApplication>> list(
            @PathVariable UUID studyId,
            @RequestParam(required = false) ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.getApplicationsByStudy(studyId, status));
    }

    @DeleteMapping("/api/recruitment/applications/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID participantId = (UUID) request.getAttribute("userId");
        applicationService.cancelApplication(id, participantId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/recruitment/screening/{applicationId}/review")
    public ResponseEntity<StudyApplication> review(
            @PathVariable UUID applicationId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(applicationService.reviewApplication(applicationId, request));
    }
}