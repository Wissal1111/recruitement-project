// client/SurveyServiceClient.java
package com.projet.recruitment_service.client;

import com.projet.recruitment_service.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "survey-service",
        url = "${services.survey-service.url}",
        configuration = FeignConfig.class)
public interface SurveyServiceClient {

    // Validate that a study/phase exists and is accessible
    @GetMapping("/api/communication/validate-phase/{studyId}/{phaseId}")
    Map<String, Object> validatePhaseAccess(
            @PathVariable("studyId") String studyId,
            @PathVariable("phaseId") String phaseId);
}
