// client/UserServiceClient.java
package com.projet.recruitment_service.client;

import com.projet.recruitment_service.dto.response.UserProfileDto;
import com.projet.recruitment_service.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "user-service",
        url = "${services.user-service.url}",
        configuration = FeignConfig.class)
public interface UserServiceClient {

    // Get single user profile
    @GetMapping("/api/profile")
    UserProfileDto getProfile(@RequestHeader("Authorization") String token);

    // Search users matching criteria (RC-04, RC-06)
    @PostMapping("/api/profile/search")
    List<UserProfileDto> searchProfiles(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> criteria);
}
