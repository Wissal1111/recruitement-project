// controller/CampaignController.java
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
import org.springframework.web.bind.annotation.RestController;

import com.projet.recruitment_service.dto.request.CampaignRequest;
import com.projet.recruitment_service.dto.response.CampaignStatsResponse;
import com.projet.recruitment_service.entity.InvitationCampaign;
import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.service.CampaignService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    // RC-06: Launch campaign
    @PostMapping("/api/recruitment/studies/{studyId}/campaigns")
    public ResponseEntity<InvitationCampaign> launch(
            @PathVariable UUID studyId,
            @RequestBody CampaignRequest request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        UUID creatorId = (UUID) httpRequest.getAttribute("userId");
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.status(201)
                .body(campaignService.launchCampaign(studyId, creatorId, request, token));
    }

    // RC-13: List campaigns
    @GetMapping("/api/recruitment/studies/{studyId}/campaigns")
    public ResponseEntity<List<InvitationCampaign>> list(@PathVariable UUID studyId) {
        return ResponseEntity.ok(campaignService.getCampaignsByStudy(studyId));
    }

    // RC-14: Cancel campaign
    @PutMapping("/api/recruitment/campaigns/{campaignId}/cancel")
    public ResponseEntity<InvitationCampaign> cancel(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(campaignService.cancelCampaign(campaignId));
    }

    // RC-21: Update expiration
    @PutMapping("/api/recruitment/campaigns/{campaignId}")
    public ResponseEntity<InvitationCampaign> updateExpiration(
            @PathVariable UUID campaignId,
            @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(
                campaignService.updateExpiration(campaignId, body.get("expirationDays")));
    }

    // RC-24: Resend invitations
    @PostMapping("/api/recruitment/campaigns/{campaignId}/resend")
    public ResponseEntity<Map<String, Object>> resend(@PathVariable UUID campaignId) {
        int count = campaignService.resendInvitations(campaignId);
        return ResponseEntity.ok(Map.of("resentCount", count));
    }

    // RC-31: Stats
    @GetMapping("/api/recruitment/campaigns/{campaignId}/stats")
    public ResponseEntity<CampaignStatsResponse> stats(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(campaignService.getCampaignStats(campaignId));
    }

    // RC-DIRECT: Send invitation to a specific user
    @PostMapping("/api/recruitment/studies/{studyId}/invite/{userId}")
    public ResponseEntity<SurveyInvitation> inviteUser(
            @PathVariable UUID studyId,
            @PathVariable UUID userId,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {

        UUID creatorId = (UUID) httpRequest.getAttribute("userId");
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.status(201)
                .body(campaignService.inviteSpecificUser(studyId, creatorId, userId, token));
    }
}
