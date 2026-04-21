package com.pawid.dto;

public record TopContributorResponse(
        Long userId,
        String displayName,
        long sightingCount
) {}
