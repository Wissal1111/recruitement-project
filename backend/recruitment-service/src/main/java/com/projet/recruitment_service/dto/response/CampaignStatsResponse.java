// dto/response/CampaignStatsResponse.java
package com.projet.recruitment_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class CampaignStatsResponse {
    private long totalInvited;
    private long totalAccepted;
    private long totalCompleted;
    private long totalDeclined;
    private long totalExpired;
    private double conversionRate;
}
