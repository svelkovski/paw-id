package com.pawid.web;

import com.pawid.dto.CreateDogRequest;
import com.pawid.dto.DogDetail;
import com.pawid.dto.DogSummary;
import com.pawid.service.DogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/dogs")
public class DogController {

    private final DogService dogService;

    public DogController(DogService dogService) {
        this.dogService = dogService;
    }

    @GetMapping
    public List<DogSummary> list() {
        return dogService.listAll();
    }

    @GetMapping("/{id}")
    public DogDetail get(@PathVariable Long id) {
        return dogService.getById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DogDetail> create(
            @Valid @RequestPart("data") CreateDogRequest data,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        DogDetail created = dogService.create(data, photo);
        return ResponseEntity
                .created(URI.create("/api/dogs/" + created.id()))
                .body(created);
    }
}
