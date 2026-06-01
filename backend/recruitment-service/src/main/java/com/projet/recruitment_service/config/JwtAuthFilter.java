package com.projet.recruitment_service.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${JWT_SECRET:your_super_secret_key}")
    private String jwtSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        log.info("AUTH HEADER: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Map<String, Object> claims = verifyAndParseToken(token);

            String userIdString = claims.get("userId") != null
                    ? claims.get("userId").toString()
                    : null;

            if (userIdString == null || userIdString.isBlank()) {
                throw new RuntimeException("userId missing from token");
            }

            UUID userId = UUID.fromString(userIdString);

            request.setAttribute("userId", userId);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userIdString,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER")));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("TOKEN VALID. userId={}", userId);

            filterChain.doFilter(request, response);

        // JwtAuthFilter.java — in the catch block
} catch (Exception e) {
    log.warn("TOKEN INVALID: {}", e.getMessage());
    SecurityContextHolder.clearContext();

    // Return 401 (Unauthorized) not 403 (Forbidden) for expired/invalid tokens
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // ← was SC_FORBIDDEN
    response.setContentType("application/json");
    response.getWriter().write("{\"message\":\"Token is not valid\"}");
}
    }

    private Map<String, Object> verifyAndParseToken(String token) throws Exception {
        String[] parts = token.split("\\.");

        if (parts.length != 3) {
            throw new RuntimeException("Invalid JWT format");
        }

        String header = parts[0];
        String payload = parts[1];
        String signature = parts[2];

        String signingInput = header + "." + payload;

        String expectedSignature = hmacSha256Base64Url(signingInput, jwtSecret);

        boolean validSignature = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8));

        if (!validSignature) {
            throw new RuntimeException("Invalid JWT signature. Secret length=" + jwtSecret.length());
        }

        byte[] decodedPayload = Base64.getUrlDecoder().decode(addPadding(payload));

        Map<String, Object> claims = objectMapper.readValue(
                decodedPayload,
                new TypeReference<Map<String, Object>>() {
                });

        Object expObj = claims.get("exp");

        if (expObj != null) {
            long exp;

            if (expObj instanceof Number number) {
                exp = number.longValue();
            } else {
                exp = Long.parseLong(expObj.toString());
            }

            long now = Instant.now().getEpochSecond();

            if (now >= exp) {
                throw new RuntimeException("JWT expired");
            }
        }

        return claims;
    }

    private String hmacSha256Base64Url(String data, String secret) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");

        SecretKeySpec keySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256");

        hmac.init(keySpec);

        byte[] signatureBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(signatureBytes);
    }

    private String addPadding(String value) {
        int padding = (4 - value.length() % 4) % 4;
        return value + "=".repeat(padding);
    }
}