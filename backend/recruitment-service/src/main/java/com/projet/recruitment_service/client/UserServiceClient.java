// client/UserServiceClient.java
package com.projet.recruitment_service.client;

import java.util.List;
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.projet.recruitment_service.config.FeignConfig;
import com.projet.recruitment_service.dto.response.UserProfileDto;

@FeignClient(name = "user-service",
        url = "${services.gateway.url}",
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

    @GetMapping("/api/users/{userId}")
Map<String, Object> getProfileByUserId(
    @RequestHeader("Authorization") String token,
    @PathVariable("userId") String userId
);
}
