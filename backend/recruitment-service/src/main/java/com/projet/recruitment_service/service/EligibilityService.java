// service/EligibilityService.java
package com.projet.recruitment_service.service;

import com.projet.recruitment_service.client.UserServiceClient;
import com.projet.recruitment_service.dto.request.CriteriaRequest;
import com.projet.recruitment_service.dto.response.UserProfileDto;
import com.projet.recruitment_service.entity.EligibilityCriteria;
import com.projet.recruitment_service.enums.EducationLevel;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.EligibilityCriteriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class EligibilityService {

    private final EligibilityCriteriaRepository criteriaRepository;
    private final UserServiceClient userServiceClient;

    // RC-01
    public EligibilityCriteria createCriteria(UUID studyId, CriteriaRequest request) {
        criteriaRepository.findByStudyId(studyId).ifPresent(existing -> {
            throw new BusinessException("Criteria already exists for this study. Use PUT to update.", HttpStatus.CONFLICT);
        });

        EligibilityCriteria criteria = EligibilityCriteria.builder()
                .studyId(studyId)
                .ageMin(request.getAgeMin())
                .ageMax(request.getAgeMax())
                .gender(request.getGender())
                .country(request.getCountry())
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
        criteria.setGender(request.getGender());
        criteria.setCountry(request.getCountry());
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
                "eligibleCount", eligibleUsers.size()
        );
    }

    // RC-05: Check if a single user is eligible
    public boolean isUserEligible(UUID userId, UUID studyId, String authToken) {
        EligibilityCriteria criteria = criteriaRepository.findByStudyId(studyId)
                .orElse(null);
        if (criteria == null) return true; // No criteria = everyone eligible

        String bearerToken = authToken.startsWith("Bearer ") ? authToken : "Bearer " + authToken;
        UserProfileDto profile = userServiceClient.getProfile(bearerToken);
        return matchesCriteria(profile, criteria);
    }

    // Fetch all eligible users via User Service
    public List<UserProfileDto> fetchEligibleUsers(EligibilityCriteria criteria, String authToken) {
        Map<String, Object> searchParams = buildSearchParams(criteria);
        try {
            return userServiceClient.searchProfiles("Bearer " + authToken, searchParams);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private Map<String, Object> buildSearchParams(EligibilityCriteria criteria) {
        Map<String, Object> params = new HashMap<>();
        if (criteria.getAgeMin() != null) params.put("ageMin", criteria.getAgeMin());
        if (criteria.getAgeMax() != null) params.put("ageMax", criteria.getAgeMax());
        if (criteria.getGender() != null) params.put("gender", criteria.getGender());
        if (criteria.getCountry() != null) params.put("country", criteria.getCountry());
        if (criteria.getEducationLevel() != null) params.put("education", criteria.getEducationLevel().name());
        if (criteria.getInterestIds() != null && !criteria.getInterestIds().isEmpty()) {
            params.put("interestIds", criteria.getInterestIds());
        }
        return params;
    }

    private boolean matchesCriteria(UserProfileDto profile, EligibilityCriteria criteria) {
        if (criteria.getAgeMin() != null && profile.getAge() != null
                && profile.getAge() < criteria.getAgeMin()) return false;
        if (criteria.getAgeMax() != null && profile.getAge() != null
                && profile.getAge() > criteria.getAgeMax()) return false;
        if (criteria.getGender() != null && !criteria.getGender().equalsIgnoreCase(profile.getGender()))
            return false;
        if (criteria.getCountry() != null && !criteria.getCountry().equalsIgnoreCase(profile.getCountry()))
            return false;
        if (criteria.getEducationLevel() != null && profile.getEducation() != null
                && !criteria.getEducationLevel().equals(profile.getEducation()))
            return false;
        return true;
    }
}
