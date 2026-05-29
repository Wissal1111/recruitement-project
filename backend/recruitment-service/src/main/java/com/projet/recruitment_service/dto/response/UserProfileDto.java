package com.projet.recruitment_service.dto.response;

import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class UserProfileDto {
    private UUID userId;
    private String email;
    private String firstname;
    private String lastname;

    private Integer age;
    private String gender;
    private String country;

    // Keep this String because user-service may send:
    // "Master's Degree", "MASTER", "Bachelor's Degree", etc.
    private String education;

    private List<UUID> interestIds;

    // Added for matching result
    private Integer matchScore;
    private List<String> matchedCriteria;
}