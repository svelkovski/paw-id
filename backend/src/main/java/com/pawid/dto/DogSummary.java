package com.pawid.dto;

import com.pawid.domain.Dog;
import com.pawid.domain.DogSize;
import com.pawid.domain.HealthStatus;

import java.time.Instant;

public record DogSummary(
        Long id,
        String displayName,         // "Bruno #0041" or "Unknown #0041"
        DogSize size,
        String color,
        String areaLabel,
        HealthStatus latestHealthStatus,
        String photoUrl,            // fully-qualified URL or null
        long sightingCount,
        Instant createdAt,
        String badge                // "NEW" | "ACTIVE" | "URGENT" — for UI only
) {
    public static DogSummary from(Dog d, long sightingCount, HealthStatus latestHealth, String photoUrl, String badge) {
        String display = (d.getName() == null || d.getName().isBlank())
                ? "Unknown #" + padId(d.getId())
                : d.getName() + " #" + padId(d.getId());
        return new DogSummary(
                d.getId(),
                display,
                d.getSize(),
                d.getColor(),
                d.getInitialAreaLabel(),
                latestHealth,
                photoUrl,
                sightingCount,
                d.getCreatedAt(),
                badge
        );
    }

    private static String padId(Long id) {
        return String.format("%04d", id);
    }
}
