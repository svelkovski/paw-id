package com.pawid.repository;

import com.pawid.domain.Dog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DogRepository extends JpaRepository<Dog, Long> {

    @Query("SELECT d FROM Dog d ORDER BY d.createdAt DESC")
    List<Dog> findAllNewestFirst();
}
