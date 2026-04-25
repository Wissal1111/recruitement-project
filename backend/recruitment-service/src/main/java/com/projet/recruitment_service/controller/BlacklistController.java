// controller/BlacklistController.java
package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.dto.request.BlacklistRequest;
import com.projet.recruitment_service.entity.ParticipantBlacklist;
import com.projet.recruitment_service.service.BlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
public class BlacklistController {

    private final BlacklistService blacklistService;

    // RC-17
    @PostMapping("/blacklist")
    public ResponseEntity<ParticipantBlacklist> blacklist(
            @RequestBody BlacklistRequest request,
            HttpServletRequest httpRequest) {
        UUID creatorId = (UUID) httpRequest.getAttribute("userId");
        return ResponseEntity.status(201).body(blacklistService.blacklist(creatorId, request));
    }

    // RC-18
    @GetMapping("/studies/{studyId}/blacklist")
    public ResponseEntity<List<ParticipantBlacklist>> getBlacklist(@PathVariable UUID studyId) {
        return ResponseEntity.ok(blacklistService.getBlacklist(studyId));
    }

    // RC-19
    @DeleteMapping("/blacklist/{id}")
    public ResponseEntity<Void> remove(@PathVariable UUID id) {
        blacklistService.removeFromBlacklist(id);
        return ResponseEntity.noContent().build();
    }
}
