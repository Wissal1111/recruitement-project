// dto/request/BlacklistRequest.java
package com.projet.recruitment_service.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class BlacklistRequest {
    private UUID studyId;
    private UUID participantId;
    private String reason;
}
