package com.pawid.web;

import com.pawid.dto.TopContributorResponse;
import com.pawid.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final AuthService authService;

    public StatsController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/top-contributor")
    public ResponseEntity<TopContributorResponse> topContributor() {
        return authService.getTopContributor()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
