// dto/response/UserProfileDto.java
package com.projet.recruitment_service.dto.response;

import com.projet.recruitment_service.enums.EducationLevel;
import lombok.Data;
import java.util.List;
import java.util.UUID;

// Matches the User Service profile response
@Data
public class UserProfileDto {
    private UUID userId;
    private String email;
    private String firstname;
    private String lastname;
    private Integer age;
    private String gender;
    private String country;
    private EducationLevel education;
    private List<UUID> interestIds;
}
