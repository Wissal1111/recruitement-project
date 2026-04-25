// dto/request/CriteriaRequest.java
package com.projet.recruitment_service.dto.request;

import com.projet.recruitment_service.enums.EducationLevel;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CriteriaRequest {
    private Integer ageMin;
    private Integer ageMax;
    private String gender;
    private String country;
    private EducationLevel educationLevel;
    private List<UUID> interestIds;
}
