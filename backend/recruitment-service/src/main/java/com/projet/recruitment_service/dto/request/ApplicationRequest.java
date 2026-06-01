package com.projet.recruitment_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ApplicationRequest {

    @NotNull(message = "studyId is required")
    private UUID studyId;

    @NotNull(message = "phaseId is required")
    private UUID phaseId;
}