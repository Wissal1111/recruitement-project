// dto/request/ParticipationStatusRequest.java
package com.projet.recruitment_service.dto.request;

import com.projet.recruitment_service.enums.ParticipationStatus;
import lombok.Data;

@Data
public class ParticipationStatusRequest {
    private ParticipationStatus status; // DROPPED or DISQUALIFIED
}
