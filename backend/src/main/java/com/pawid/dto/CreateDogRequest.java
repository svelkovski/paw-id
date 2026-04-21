package com.pawid.dto;

import com.pawid.domain.DogSize;
import com.pawid.domain.HealthStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Input payload for POST /api/dogs. Arrives as the JSON part of a multipart/form-data request.
 * The photo (if any) arrives as a separate part called "photo".
 */
public record CreateDogRequest(

        @Size(max = 100)
        String name,                       // optional

        @NotNull
        DogSize size,

        @NotBlank
        @Size(max = 60)
        String color,

        @Size(max = 1000)
        String description,

        @NotNull
        HealthStatus initialHealthStatus,

        @Size(max = 200)
        String initialAreaLabel,

        Double initialLatitude,
        Double initialLongitude
) {}
