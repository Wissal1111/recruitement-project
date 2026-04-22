// dto/request/SlotRequest.java
package com.projet.recruitment_service.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SlotRequest {
    private int totalSlots;
    private BigDecimal rewardAmount;
}
