package com.projet.recruitment_service.controller;

import com.projet.recruitment_service.client.SurveyServiceClient;
import com.projet.recruitment_service.entity.StudyApplication;
import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.enums.ApplicationStatus;
import com.projet.recruitment_service.enums.InvitationStatus;
import com.projet.recruitment_service.service.EligibilityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.projet.recruitment_service.repository.StudyApplicationRepository;
import com.projet.recruitment_service.repository.SurveyInvitationRepository;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
public class DiscoveryController {

    private final EligibilityService eligibilityService;
    private final SurveyServiceClient surveyServiceClient;
    private final StudyApplicationRepository applicationRepository;
    private final SurveyInvitationRepository invitationRepository;

    @GetMapping("/studies/eligible")
public ResponseEntity<List<Map<String, Object>>> getEligibleStudies(
        @RequestHeader("Authorization") String authHeader,
        HttpServletRequest request) {

    UUID participantId = (UUID) request.getAttribute("userId");
    String token = authHeader.replace("Bearer ", "");

    // Studies with non-rejected applications
    Set<UUID> appliedStudies = applicationRepository
            .findByParticipantId(participantId)
            .stream()
            .filter(a -> a.getStatus() != ApplicationStatus.REJECTED)
            .map(StudyApplication::getStudyId)
            .collect(Collectors.toSet());

    // Studies with pending or accepted invitations
    Set<UUID> invitedStudies = invitationRepository
            .findByUserId(participantId)
            .stream()
            .filter(i -> i.getStatus() == InvitationStatus.PENDING
                      || i.getStatus() == InvitationStatus.ACCEPTED)
            .map(SurveyInvitation::getStudyId)
            .collect(Collectors.toSet());

    // Combined exclusion set
    Set<UUID> excluded = new HashSet<>();
    excluded.addAll(appliedStudies);
    excluded.addAll(invitedStudies);

    // Get all active studies and filter
    List<Map<String, Object>> allStudies = surveyServiceClient
            .getActiveStudies("Bearer " + token);

    List<Map<String, Object>> eligible = allStudies.stream()
            .filter(study -> {
                try {
                    UUID studyId = UUID.fromString(study.get("studyId").toString());
                    if (excluded.contains(studyId)) return false;
                    return eligibilityService.isUserEligible(participantId, studyId, token);
                } catch (Exception e) {
                    return false;
                }
            })
            .collect(Collectors.toList());

    return ResponseEntity.ok(eligible);
}
}