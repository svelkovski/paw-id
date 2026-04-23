package com.pawid.service;

import com.pawid.domain.Dog;
import com.pawid.domain.HealthStatus;
import com.pawid.domain.Sighting;
import com.pawid.dto.CreateDogRequest;
import com.pawid.dto.DogDetail;
import com.pawid.dto.DogSummary;
import com.pawid.dto.SightingResponse;
import com.pawid.exception.NotFoundException;
import com.pawid.repository.DogRepository;
import com.pawid.repository.SightingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class DogService {

    private final DogRepository dogRepository;
    private final SightingRepository sightingRepository;
    private final PhotoStorageService photoStorage;

    public DogService(DogRepository dogRepository,
                      SightingRepository sightingRepository,
                      PhotoStorageService photoStorage) {
        this.dogRepository = dogRepository;
        this.sightingRepository = sightingRepository;
        this.photoStorage = photoStorage;
    }

    @Transactional(readOnly = true)
    public List<DogSummary> listAll() {
        return dogRepository.findAllNewestFirst().stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public DogDetail getById(Long id) {
        Dog dog = dogRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dog not found: " + id));
        List<Sighting> sightings = sightingRepository.findByDogIdOrderByReportedAtDesc(id);
        List<SightingResponse> sightingDtos = sightings.stream()
                .map(s -> SightingResponse.from(s, photoUrl(s.getPhotoFilename())))
                .toList();
        String badge = computeBadge(dog, sightings);
        return DogDetail.from(dog, photoUrl(dog.getPhotoFilename()), badge, sightingDtos);
    }

    @Transactional
    public DogDetail create(CreateDogRequest req, MultipartFile photo) {
        Dog dog = new Dog();
        dog.setName(nullIfBlank(req.name()));
        dog.setSize(req.size());
        dog.setColor(req.color());
        dog.setDescription(nullIfBlank(req.description()));
        dog.setInitialHealthStatus(req.initialHealthStatus());
        dog.setInitialAreaLabel(nullIfBlank(req.initialAreaLabel()));
        dog.setInitialLatitude(req.initialLatitude());
        dog.setInitialLongitude(req.initialLongitude());
        dog.setPhotoFilename(photoStorage.store(photo));

        Dog saved = dogRepository.save(dog);
        return DogDetail.from(saved, photoUrl(saved.getPhotoFilename()), "NEW", List.of());
    }

    private DogSummary toSummary(Dog d) {
        List<Sighting> sightings = sightingRepository.findByDogIdOrderByReportedAtDesc(d.getId());
        HealthStatus latest = sightings.isEmpty() ? d.getInitialHealthStatus() : sightings.get(0).getHealthStatus();
        return DogSummary.from(d, sightings.size(), latest, photoUrl(d.getPhotoFilename()), computeBadge(d, sightings));
    }

    private String computeBadge(Dog dog, List<Sighting> sightings) {
        HealthStatus latest = sightings.isEmpty() ? dog.getInitialHealthStatus() : sightings.get(0).getHealthStatus();
        if (latest == HealthStatus.INJURED || latest == HealthStatus.SICK) {
            return "URGENT";
        }
        if (sightings.isEmpty() && dog.getCreatedAt() != null
                && Duration.between(dog.getCreatedAt(), Instant.now()).toHours() < 48) {
            return "NEW";
        }
        return "ACTIVE";
    }

    private String photoUrl(String filename) {
        if (filename == null || filename.isBlank()) return null;
        return "/uploads/" + filename;
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
