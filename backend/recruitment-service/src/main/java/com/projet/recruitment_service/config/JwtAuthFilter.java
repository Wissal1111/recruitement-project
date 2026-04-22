// config/JwtAuthFilter.java
package com.projet.recruitment_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.extern.slf4j.Slf4j;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.info("AUTH HEADER: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.info("NO BEARER TOKEN - skipping");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (jwtUtil.isTokenValid(token)) {
                UUID userId = jwtUtil.extractUserId(token);
                log.info("TOKEN VALID - userId: {}", userId);

                request.setAttribute("userId", userId);

                var claims = jwtUtil.extractClaims(token);
                String roles = claims.get("roles", String.class);
                List<SimpleGrantedAuthority> authorities = List.of();
                if (roles != null) {
                    authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roles));
                }

                var auth = new UsernamePasswordAuthenticationToken(
                        userId.toString(), null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                log.warn("TOKEN INVALID");
            }
        } catch (Exception e) {
            log.error("JWT ERROR: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
