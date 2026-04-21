package com.pawid.dto;

import com.pawid.domain.HealthStatus;
import com.pawid.domain.Sighting;

import java.time.Instant;

public record SightingResponse(
        Long id,
        HealthStatus healthStatus,
        String note,
        String areaLabel,
        Double latitude,
        Double longitude,
        String photoUrl,
        Instant reportedAt,
        String reporterName   // display name of the user who filed this sighting, or "Anonymous"
) {
    public static SightingResponse from(Sighting s, String photoUrl) {
        String reporter = (s.getReporter() != null)
                ? s.getReporter().getDisplayName()
                : "Anonymous";
        return new SightingResponse(
                s.getId(),
                s.getHealthStatus(),
                s.getNote(),
                s.getAreaLabel(),
                s.getLatitude(),
                s.getLongitude(),
                photoUrl,
                s.getReportedAt(),
                reporter
        );
    }
}
