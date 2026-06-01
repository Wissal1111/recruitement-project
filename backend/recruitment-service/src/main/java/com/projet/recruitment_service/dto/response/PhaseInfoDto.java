package com.projet.recruitment_service.dto.response;

import java.util.UUID;

import lombok.Data;

@Data
public class PhaseInfoDto {
    private UUID studyId;
    private UUID phaseId;
    private Integer maxParticipants;
    private java.math.BigDecimal rewardAmount;
    private Integer phaseOrder;
    private String phaseType;
    private Boolean isMultiPhase;
    private UUID previousPhaseId;
}