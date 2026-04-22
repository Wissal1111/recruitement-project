// controller/ParticipationController.java
package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.dto.request.ParticipationStatusRequest;
import com.projet.recruitment_service.entity.Participation;
import com.projet.recruitment_service.service.ParticipationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment/participations")
@RequiredArgsConstructor
public class ParticipationController {

    private final ParticipationService participationService;

    // RC-25
    @PostMapping("/start")
    public ResponseEntity<Participation> start(@RequestBody Map<String, UUID> body) {
        return ResponseEntity.status(201)
                .body(participationService.startParticipation(body.get("applicationId")));
    }

    // RC-26
    @PutMapping("/{id}/complete")
    public ResponseEntity<Participation> complete(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID participantId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(participationService.completeParticipation(id, participantId));
    }

    // RC-27
    @PutMapping("/{id}/status")
    public ResponseEntity<Participation> updateStatus(
            @PathVariable UUID id,
            @RequestBody ParticipationStatusRequest body,
            HttpServletRequest request) {
        UUID participantId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(
                participationService.updateParticipationStatus(id, participantId, body.getStatus()));
    }

    // RC-28
    @GetMapping("/me")
    public ResponseEntity<List<Participation>> getMyParticipations(HttpServletRequest request) {
        UUID participantId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(participationService.getMyParticipations(participantId));
    }
}
