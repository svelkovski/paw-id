package com.pawid.service;

import com.pawid.domain.AppUser;
import com.pawid.dto.AuthDTOs;
import com.pawid.dto.TopContributorResponse;
import com.pawid.repository.SightingRepository;
import com.pawid.repository.UserRepository;
import com.pawid.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SightingRepository sightingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       SightingRepository sightingRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.sightingRepository = sightingRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        AppUser user = new AppUser();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setDisplayName(req.displayName());

        AppUser saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved.getEmail(), saved.getDisplayName(), saved.getId());
        return new AuthDTOs.AuthResponse(token, saved.getId(), saved.getEmail(), saved.getDisplayName());
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest req) {
        AppUser user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getDisplayName(), user.getId());
        return new AuthDTOs.AuthResponse(token, user.getId(), user.getEmail(), user.getDisplayName());
    }

    @Transactional(readOnly = true)
    public Optional<TopContributorResponse> getTopContributor() {
        return userRepository.findAllOrderedBySightingCountDesc()
                .stream()
                .findFirst()
                .map(u -> new TopContributorResponse(
                        u.getId(),
                        u.getDisplayName(),
                        sightingRepository.countByReporterId(u.getId())
                ));
    }
}
