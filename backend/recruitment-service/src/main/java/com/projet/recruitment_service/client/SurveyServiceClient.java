package com.projet.recruitment_service.client;
import java.util.List;
import java.util.Map;
import com.projet.recruitment_service.dto.response.PhaseInfoDto;
import com.projet.recruitment_service.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "survey-service",
        url = "${services.survey-service.url}",
        configuration = FeignConfig.class
)
public interface SurveyServiceClient {

    @GetMapping("/api/studies/phase/{phaseId}")
    PhaseInfoDto getPhaseInfo(
            @RequestHeader("Authorization") String token,
            @PathVariable("phaseId") String phaseId
    );
    @GetMapping("/api/studies/active")
    List<Map<String, Object>> getActiveStudies(@RequestHeader("Authorization") String token);
}