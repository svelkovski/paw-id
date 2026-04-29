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

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DogSize size;

    @Column(nullable = false, length = 60)
    private String color;

    @Column(length = 1000)
    private String description;

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

    @OneToMany(mappedBy = "dog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sighting> sightings = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
