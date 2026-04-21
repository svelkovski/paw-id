package com.pawid.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "dog")
public class Dog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Optional — many strays have no known name. */
    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DogSize size;

    /** Free text (e.g. "brown and white"). Enum would be too restrictive. */
    @Column(nullable = false, length = 60)
    private String color;

    @Column(length = 1000)
    private String description;

    /** Filename inside the uploads directory. Null means no photo was provided. */
    @Column(name = "photo_filename", length = 255)
    private String photoFilename;

    @Enumerated(EnumType.STRING)
    @Column(name = "initial_health_status", nullable = false, length = 30)
    private HealthStatus initialHealthStatus;

    @Column(name = "initial_area_label", length = 200)
    private String initialAreaLabel;

    @Column(name = "initial_latitude")
    private Double initialLatitude;

    @Column(name = "initial_longitude")
    private Double initialLongitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * We fetch sightings explicitly when needed (the detail page),
     * so default lazy loading is fine. We keep the list here mostly for cascade convenience.
     */
    @OneToMany(mappedBy = "dog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sighting> sightings = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
