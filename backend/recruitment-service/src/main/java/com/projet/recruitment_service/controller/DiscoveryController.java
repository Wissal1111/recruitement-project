package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.client.SurveyServiceClient;
import com.projet.recruitment_service.service.EligibilityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
public class DiscoveryController {

    private final EligibilityService eligibilityService;
    private final SurveyServiceClient surveyServiceClient;

    @GetMapping("/studies/eligible")
    public ResponseEntity<List<Map<String, Object>>> getEligibleStudies(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest request) {

        UUID participantId = (UUID) request.getAttribute("userId");
        String token = authHeader.replace("Bearer ", "");

        // 1. Récupérer toutes les studies actives
        List<Map<String, Object>> allStudies = surveyServiceClient.getActiveStudies("Bearer " + token);

        // 2. Filtrer selon éligibilité du participant
        List<Map<String, Object>> eligible = allStudies.stream()
                .filter(study -> {
                    try {
                        UUID studyId = UUID.fromString(study.get("_id").toString());
                        return eligibilityService.isUserEligible(participantId, studyId, token);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(eligible);
    }
}