package com.pawid.repository;

import com.pawid.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM AppUser u
        LEFT JOIN Sighting s ON s.reporter = u
        GROUP BY u
        ORDER BY COUNT(s) DESC
        """)
    List<AppUser> findAllOrderedBySightingCountDesc();
}
