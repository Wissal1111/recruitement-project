// dto/request/CampaignRequest.java
package com.projet.recruitment_service.dto.request;

import lombok.Data;

@Data
public class CampaignRequest {
    private int targetCount;
    private int expirationDays = 7;
}
