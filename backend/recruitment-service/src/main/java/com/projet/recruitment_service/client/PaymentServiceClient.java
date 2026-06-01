package com.projet.recruitment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(
        name = "payment-service",
        url = "${services.gateway.url}",
        configuration = FeignConfig.class
)
public interface PaymentServiceClient {

    // Appelé quand un participant complète une phase
    @PostMapping("/api/rewards/complete-phase")
    Map<String, Object> completePhase(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request);

    // Appelé quand un creator alloue des points
    @PostMapping("/api/points/allocate")
    Map<String, Object> allocatePoints(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request);

    // Appelé quand un creator libère des points
    @PostMapping("/api/points/release")
    Map<String, Object> releasePoints(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request);
}