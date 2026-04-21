package com.pawid.service;

import com.pawid.domain.AppUser;
import com.pawid.domain.Dog;
import com.pawid.domain.Sighting;
import com.pawid.dto.CreateSightingRequest;
import com.pawid.dto.SightingResponse;
import com.pawid.exception.NotFoundException;
import com.pawid.repository.DogRepository;
import com.pawid.repository.SightingRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SightingService {

    private final DogRepository dogRepository;
    private final SightingRepository sightingRepository;
    private final PhotoStorageService photoStorage;

    public SightingService(DogRepository dogRepository,
                           SightingRepository sightingRepository,
                           PhotoStorageService photoStorage) {
        this.dogRepository = dogRepository;
        this.sightingRepository = sightingRepository;
        this.photoStorage = photoStorage;
    }

    @Transactional
    public SightingResponse createForDog(Long dogId, CreateSightingRequest req, MultipartFile photo) {
        Dog dog = dogRepository.findById(dogId)
                .orElseThrow(() -> new NotFoundException("Dog not found: " + dogId));

        // Attach the currently authenticated user as the reporter (null if anonymous).
        AppUser reporter = currentUser();

        Sighting sighting = new Sighting();
        sighting.setDog(dog);
        sighting.setHealthStatus(req.healthStatus());
        sighting.setNote(nullIfBlank(req.note()));
        sighting.setAreaLabel(nullIfBlank(req.areaLabel()));
        sighting.setLatitude(req.latitude());
        sighting.setLongitude(req.longitude());
        sighting.setPhotoFilename(photoStorage.store(photo));
        sighting.setReporter(reporter);

        Sighting saved = sightingRepository.save(sighting);
        String url = saved.getPhotoFilename() == null ? null : "/uploads/" + saved.getPhotoFilename();
        return SightingResponse.from(saved, url);
    }

    /** Returns the AppUser from the security context, or null for unauthenticated requests. */
    private AppUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AppUser user) {
            return user;
        }
        return null;
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}

