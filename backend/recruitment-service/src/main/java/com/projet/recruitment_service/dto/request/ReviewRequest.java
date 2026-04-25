// dto/request/ReviewRequest.java
package com.projet.recruitment_service.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private boolean approved;
    private String rejectionReason;
}
