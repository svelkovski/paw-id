package com.pawid.dto;

import com.pawid.domain.Dog;
import com.pawid.domain.DogSize;
import com.pawid.domain.HealthStatus;

import java.time.Instant;
import java.util.List;

public record DogDetail(
        Long id,
        String displayName,
        String name,
        DogSize size,
        String color,
        String description,
        HealthStatus initialHealthStatus,
        String initialAreaLabel,
        Double initialLatitude,
        Double initialLongitude,
        String photoUrl,
        Instant createdAt,
        String badge,
        List<SightingResponse> sightings
) {
    public static DogDetail from(Dog d, String photoUrl, String badge, List<SightingResponse> sightings) {
        String display = (d.getName() == null || d.getName().isBlank())
                ? "Unknown #" + String.format("%04d", d.getId())
                : d.getName() + " #" + String.format("%04d", d.getId());
        return new DogDetail(
                d.getId(),
                display,
                d.getName(),
                d.getSize(),
                d.getColor(),
                d.getDescription(),
                d.getInitialHealthStatus(),
                d.getInitialAreaLabel(),
                d.getInitialLatitude(),
                d.getInitialLongitude(),
                photoUrl,
                d.getCreatedAt(),
                badge,
                sightings
        );
    }
}
