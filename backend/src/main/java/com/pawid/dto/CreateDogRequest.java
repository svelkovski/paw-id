package com.pawid.dto;

import com.pawid.domain.DogSize;
import com.pawid.domain.HealthStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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
