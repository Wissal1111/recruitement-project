// controller/InvitationController.java
package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.service.InvitationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // RC-07
    @GetMapping("/me")
    public ResponseEntity<List<SurveyInvitation>> getMyInvitations(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(invitationService.getMyInvitations(userId));
    }

    // RC-08
    @PutMapping("/{id}/accept")
    public ResponseEntity<StudyApplication> accept(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(invitationService.acceptInvitation(id, userId));
    }

    // RC-09
    @PutMapping("/{id}/decline")
    public ResponseEntity<SurveyInvitation> decline(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(invitationService.declineInvitation(id, userId));
    }
}
