package com.pawid.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "sighting")
public class Sighting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * We store only the relationship side that matters (the FK). Loading the parent dog
     * back from the sighting is rarely needed, so LAZY avoids accidental N+1 queries.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dog_id", nullable = false)
    private Dog dog;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", nullable = false, length = 30)
    private HealthStatus healthStatus;

    @Column(length = 1000)
    private String note;

    @Column(name = "area_label", length = 200)
    private String areaLabel;

    private Double latitude;
    private Double longitude;

    @Column(name = "photo_filename", length = 255)
    private String photoFilename;

    /** The user who reported this sighting. Null for legacy/anonymous sightings. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private AppUser reporter;

    @Column(name = "reported_at", nullable = false, updatable = false)
    private Instant reportedAt;

    @PrePersist
    void onCreate() {
        if (reportedAt == null) {
            reportedAt = Instant.now();
        }
    }
}
