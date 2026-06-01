package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.dto.response.InvitationDto;  // ← add this
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

    @GetMapping("/me")
    public ResponseEntity<List<InvitationDto>> getMyInvitations(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(invitationService.getMyInvitations(userId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<StudyApplication> accept(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(invitationService.acceptInvitation(id, userId));
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<SurveyInvitation> decline(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(invitationService.declineInvitation(id, userId));
    }
}