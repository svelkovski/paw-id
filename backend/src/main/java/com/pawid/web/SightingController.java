package com.pawid.web;

import com.pawid.dto.CreateSightingRequest;
import com.pawid.dto.SightingResponse;
import com.pawid.service.SightingService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/dogs/{dogId}/sightings")
public class SightingController {

    private final SightingService sightingService;

    public SightingController(SightingService sightingService) {
        this.sightingService = sightingService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SightingResponse> create(
            @PathVariable Long dogId,
            @Valid @RequestPart("data") CreateSightingRequest data,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        SightingResponse created = sightingService.createForDog(dogId, data, photo);
        return ResponseEntity.status(201).body(created);
    }
}
