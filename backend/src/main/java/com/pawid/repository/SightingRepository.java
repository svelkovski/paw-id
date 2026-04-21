package com.pawid.repository;

import com.pawid.domain.Sighting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SightingRepository extends JpaRepository<Sighting, Long> {

    List<Sighting> findByDogIdOrderByReportedAtDesc(Long dogId);

    long countByDogId(Long dogId);

    long countByReporterId(Long reporterId);
}
