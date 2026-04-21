package com.pawid.dto;

import com.pawid.domain.HealthStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSightingRequest(

        @NotNull
        HealthStatus healthStatus,

        @Size(max = 1000)
        String note,

        @Size(max = 200)
        String areaLabel,

        Double latitude,
        Double longitude
) {}
