package com.projet.recruitment_service.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class PhaseInfoDto {
    private UUID studyId;
    private UUID phaseId;
    private Integer phaseOrder;
    private String phaseType;
    private Boolean isMultiPhase;
    private UUID previousPhaseId;
}