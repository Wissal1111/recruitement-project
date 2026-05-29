package com.projet.recruitment_service.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.projet.recruitment_service.client.UserServiceClient;
import com.projet.recruitment_service.dto.request.CriteriaRequest;
import com.projet.recruitment_service.dto.response.UserProfileDto;
import com.projet.recruitment_service.entity.EligibilityCriteria;
import com.projet.recruitment_service.enums.EducationLevel;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.EligibilityCriteriaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EligibilityService {

    private final EligibilityCriteriaRepository criteriaRepository;
    private final UserServiceClient userServiceClient;

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
    public List<UserProfileDto> fetchEligibleUsers(EligibilityCriteria criteria, String authToken) {
        try {
            String bearerToken = authToken.startsWith("Bearer ")
                    ? authToken
                    : "Bearer " + authToken;

            // Fetch broadly instead of strict criteria search
            Map<String, Object> broadSearch = new HashMap<>();

            List<UserProfileDto> users = userServiceClient.searchProfiles(bearerToken, broadSearch);

            if (users == null) {
                return Collections.emptyList();
            }

            List<UserProfileDto> matchedUsers = new ArrayList<>();

            for (UserProfileDto user : users) {
                MatchResult result = calculateMatch(user, criteria);

                if (result.matchScore >= 70 || result.matchedCount >= 3) {
                    user.setMatchScore(result.matchScore);
                    user.setMatchedCriteria(result.matchedCriteria);
                    matchedUsers.add(user);
                }
            }

            matchedUsers.sort((a, b) -> {
                int scoreA = a.getMatchScore() == null ? 0 : a.getMatchScore();
                int scoreB = b.getMatchScore() == null ? 0 : b.getMatchScore();
                return Integer.compare(scoreB, scoreA);
            });

            return matchedUsers;

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private MatchResult calculateMatch(UserProfileDto profile, EligibilityCriteria criteria) {
        int totalCriteria = 0;
        int matchedCriteriaCount = 0;
        List<String> matchedCriteriaNames = new ArrayList<>();

        // AGE
        if (criteria.getAgeMin() != null || criteria.getAgeMax() != null) {
            totalCriteria++;

            Integer age = profile.getAge();
            boolean ageOk = true;

            if (age == null) {
                ageOk = false;
            }

            if (age != null && criteria.getAgeMin() != null && age < criteria.getAgeMin()) {
                ageOk = false;
            }

            if (age != null && criteria.getAgeMax() != null && age > criteria.getAgeMax()) {
                ageOk = false;
            }

            if (ageOk) {
                matchedCriteriaCount++;
                matchedCriteriaNames.add("age");
            }
        }

        // GENDER
        if (criteria.getGender() != null && !criteria.getGender().isBlank()) {
            totalCriteria++;

            if (profile.getGender() != null &&
                    criteria.getGender().equalsIgnoreCase(profile.getGender())) {
                matchedCriteriaCount++;
                matchedCriteriaNames.add("gender");
            }
        }

        // COUNTRY
        if (criteria.getCountry() != null && !criteria.getCountry().isBlank()) {
            totalCriteria++;

            if (profile.getCountry() != null &&
                    criteria.getCountry().equalsIgnoreCase(profile.getCountry())) {
                matchedCriteriaCount++;
                matchedCriteriaNames.add("country");
            }
        }

        // EDUCATION
        if (criteria.getEducationLevel() != null) {
            totalCriteria++;

            if (educationMatches(criteria.getEducationLevel(), profile.getEducation())) {
                matchedCriteriaCount++;
                matchedCriteriaNames.add("education");
            }
        }

        // INTERESTS
        if (criteria.getInterestIds() != null && !criteria.getInterestIds().isEmpty()) {
            totalCriteria++;

            List<UUID> userInterests = profile.getInterestIds();

            if (userInterests != null && !userInterests.isEmpty()) {
                boolean hasCommonInterest = false;

                for (UUID interestId : userInterests) {
                    if (criteria.getInterestIds().contains(interestId)) {
                        hasCommonInterest = true;
                        break;
                    }
                }

                if (hasCommonInterest) {
                    matchedCriteriaCount++;
                    matchedCriteriaNames.add("interests");
                }
            }
        }

        // If no criteria exists, everyone matches 100%
        if (totalCriteria == 0) {
            return new MatchResult(100, 0, List.of("all"));
        }

        int score = (int) Math.round((matchedCriteriaCount * 100.0) / totalCriteria);

        return new MatchResult(score, matchedCriteriaCount, matchedCriteriaNames);
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