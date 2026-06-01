package com.projet.recruitment_service.service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.projet.recruitment_service.client.UserServiceClient;
import com.projet.recruitment_service.dto.request.CriteriaRequest;
import com.projet.recruitment_service.dto.response.UserProfileDto;
import com.projet.recruitment_service.entity.EligibilityCriteria;
import com.projet.recruitment_service.entity.SurveyInvitation;
import com.projet.recruitment_service.enums.EducationLevel;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.EligibilityCriteriaRepository;
import com.projet.recruitment_service.repository.SurveyInvitationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EligibilityService {

    private final EligibilityCriteriaRepository criteriaRepository;
    private final UserServiceClient userServiceClient;
    private final SurveyInvitationRepository invitationRepository;

    // RC-01
    public EligibilityCriteria createCriteria(UUID studyId, CriteriaRequest request) {
        criteriaRepository.findByStudyId(studyId).ifPresent(existing -> {
            throw new BusinessException(
                    "Criteria already exists for this study. Use PUT to update.",
                    HttpStatus.CONFLICT);
        });

        EligibilityCriteria criteria = EligibilityCriteria.builder()
                .studyId(studyId)
                .ageMin(request.getAgeMin())
                .ageMax(request.getAgeMax())
                .gender(normalizeNullable(request.getGender()))
                .country(normalizeNullable(request.getCountry()))
                .educationLevel(request.getEducationLevel())
                .interestIds(request.getInterestIds())
                .build();

        return criteriaRepository.save(criteria);
    }

    // RC-02
    public EligibilityCriteria getCriteria(UUID studyId) {
        return criteriaRepository.findByStudyId(studyId)
                .orElseThrow(() -> new BusinessException("Criteria not found for study", HttpStatus.NOT_FOUND));
    }

    // RC-03
    public EligibilityCriteria updateCriteria(UUID studyId, CriteriaRequest request) {
        EligibilityCriteria criteria = getCriteria(studyId);

        criteria.setAgeMin(request.getAgeMin());
        criteria.setAgeMax(request.getAgeMax());
        criteria.setGender(normalizeNullable(request.getGender()));
        criteria.setCountry(normalizeNullable(request.getCountry()));
        criteria.setEducationLevel(request.getEducationLevel());
        criteria.setInterestIds(request.getInterestIds());

        return criteriaRepository.save(criteria);
    }

    // RC-04: Preview eligible pool
    public Map<String, Object> previewEligiblePool(UUID studyId, String authToken) {
        EligibilityCriteria criteria = getCriteria(studyId);
        List<UserProfileDto> eligibleUsers = fetchEligibleUsers(criteria, authToken);

        return Map.of(
                "studyId", studyId,
                "eligibleCount", eligibleUsers.size(),
                "eligibleUsers", eligibleUsers);
    }

    // RC-05: Check if a single user is eligible
    public boolean isUserEligible(UUID userId, UUID studyId, String authToken) {
        EligibilityCriteria criteria = criteriaRepository.findByStudyId(studyId).orElse(null);

        if (criteria == null) {
            return true;
        }

        String bearerToken = authToken.startsWith("Bearer ")
                ? authToken
                : "Bearer " + authToken;

        UserProfileDto profile = userServiceClient.getProfile(bearerToken);

        MatchResult result = calculateMatch(profile, criteria);

        return result.matchScore >= 70 || result.matchedCount >= 3;
    }

    /**
     * Fetch users and apply PARTIAL MATCHING.
     *
     * Important:
     * We intentionally fetch broad/all profiles first, then score them locally.
     * If userServiceClient.searchProfiles(empty map) does not return all users,
     * then user-service needs an endpoint that returns searchable users.
     */
   public List<UserProfileDto> fetchEligibleUsers(
        EligibilityCriteria criteria,
        String authToken) {

    try {
        String bearerToken = authToken.startsWith("Bearer ")
                ? authToken
                : "Bearer " + authToken;

        UUID requesterId = extractUserIdFromToken(bearerToken);

        // ✅ FETCH ALL USERS (already supported by empty map)
        List<UserProfileDto> users = userServiceClient.searchProfiles(
                bearerToken,
                new HashMap<>());

        if (users == null) {
            return Collections.emptyList();
        }

        List<UserProfileDto> result = new ArrayList<>();

        for (UserProfileDto user : users) {

            if (user.getUserId() == null) continue;

            // skip creator
            if (requesterId != null && user.getUserId().equals(requesterId)) continue;

            // ✅ NO CRITERIA = EVERYONE IS ELIGIBLE
            if (criteria == null) {
                result.add(user);
                continue;
            }

            MatchResult match = calculateMatch(user, criteria);

            if (match.matchScore >= 60 || match.matchedCount >= 2) {
                user.setMatchScore(match.matchScore);
                user.setMatchedCriteria(match.matchedCriteria);
                result.add(user);
            }
        }

        result.sort((a, b) -> Integer.compare(
                b.getMatchScore() == null ? 0 : b.getMatchScore(),
                a.getMatchScore() == null ? 0 : a.getMatchScore()
        ));

        return result;

    } catch (Exception e) {
        e.printStackTrace();
        return Collections.emptyList();
    }
}

    private MatchResult calculateMatch(UserProfileDto profile, EligibilityCriteria criteria) {
        int totalCriteria = 0;
        int matchedCount = 0;
        List<String> matchedCriteria = new ArrayList<>();

        // AGE
        if (criteria.getAgeMin() != null || criteria.getAgeMax() != null) {
            Integer age = profile.getAge();

            // If profile has no age, skip age criterion instead of failing it.
            if (age != null) {
                totalCriteria++;

                boolean ok = true;

                if (criteria.getAgeMin() != null && age < criteria.getAgeMin()) {
                    ok = false;
                }

                if (criteria.getAgeMax() != null && age > criteria.getAgeMax()) {
                    ok = false;
                }

                if (ok) {
                    matchedCount++;
                    matchedCriteria.add("age");
                }
            }
        }

        // GENDER
        if (criteria.getGender() != null && !criteria.getGender().isBlank()) {
            totalCriteria++;

            if (profile.getGender() != null &&
                    criteria.getGender().equalsIgnoreCase(profile.getGender())) {
                matchedCount++;
                matchedCriteria.add("gender");
            }
        }

        // COUNTRY
        if (criteria.getCountry() != null && !criteria.getCountry().isBlank()) {
            totalCriteria++;

            if (profile.getCountry() != null &&
                    criteria.getCountry().equalsIgnoreCase(profile.getCountry())) {
                matchedCount++;
                matchedCriteria.add("country");
            }
        }

        // EDUCATION
        if (criteria.getEducationLevel() != null) {
            totalCriteria++;

            if (educationMatches(criteria.getEducationLevel(), profile.getEducation())) {
                matchedCount++;
                matchedCriteria.add("education");
            }
        }

        // INTERESTS
        if (criteria.getInterestIds() != null && !criteria.getInterestIds().isEmpty()) {
            totalCriteria++;

            List<UUID> userInterests = profile.getInterestIds();

            if (userInterests != null && !userInterests.isEmpty()) {
                boolean common = false;

                for (UUID id : userInterests) {
                    if (criteria.getInterestIds().contains(id)) {
                        common = true;
                        break;
                    }
                }

                if (common) {
                    matchedCount++;
                    matchedCriteria.add("interests");
                }
            }
        }

        if (totalCriteria == 0) {
            return new MatchResult(100, 0, List.of("all"));
        }

        int score = (int) Math.round((matchedCount * 100.0) / totalCriteria);

        return new MatchResult(score, matchedCount, matchedCriteria);
    }

    private UUID extractUserIdFromToken(String bearerToken) {
        try {
            String token = bearerToken.replace("Bearer ", "");
            String[] parts = token.split("\\.");

            if (parts.length != 3) {
                return null;
            }

            String payload = parts[1];

            int padding = (4 - payload.length() % 4) % 4;
            payload = payload + "=".repeat(padding);

            byte[] decoded = Base64.getUrlDecoder().decode(payload);
            String json = new String(decoded);

            int index = json.indexOf("\"userId\"");
            if (index == -1)
                return null;

            int colon = json.indexOf(":", index);
            int firstQuote = json.indexOf("\"", colon);
            int secondQuote = json.indexOf("\"", firstQuote + 1);

            String userId = json.substring(firstQuote + 1, secondQuote);

            return UUID.fromString(userId);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean educationMatches(EducationLevel criteriaEducation, String userEducationRaw) {
        if (criteriaEducation == null || userEducationRaw == null) {
            return false;
        }

        String userEducation = userEducationRaw
                .trim()
                .toUpperCase()
                .replace("'", "")
                .replace("’", "")
                .replace("-", "_")
                .replace(" ", "_");

        switch (criteriaEducation) {
            case HIGH_SCHOOL:
                return userEducation.contains("HIGH");

            case BACHELOR:
                return userEducation.contains("BACHELOR");

            case MASTER:
                return userEducation.contains("MASTER");

            case PHD:
                return userEducation.contains("PHD") ||
                        userEducation.contains("DOCTOR");

            case OTHER:
                return userEducation.contains("OTHER");

            default:
                return false;
        }
    }

    private String normalizeNullable(String value) {
        if (value == null)
            return null;
        if (value.trim().isEmpty())
            return null;
        return value.trim();
    }

    private static class MatchResult {
        int matchScore;
        int matchedCount;
        List<String> matchedCriteria;

        MatchResult(int matchScore, int matchedCount, List<String> matchedCriteria) {
            this.matchScore = matchScore;
            this.matchedCount = matchedCount;
            this.matchedCriteria = matchedCriteria;
        }
    }

}