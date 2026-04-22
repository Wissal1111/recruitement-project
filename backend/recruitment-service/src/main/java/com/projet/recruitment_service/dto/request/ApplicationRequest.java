// dto/request/ApplicationRequest.java
package com.projet.recruitment_service.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class ApplicationRequest {
    private UUID studyId;
    private UUID phaseId;
}
