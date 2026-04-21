package com.pawid.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Saves uploaded photos to a local folder and returns a filename that can be stored in the DB.
 *
 * Design notes:
 *   - We don't trust the client-supplied filename (it could contain path separators).
 *   - We generate our own UUID-based name and keep only the extension from the upload.
 *   - Only common image extensions are accepted. Everything else is rejected.
 */
@Service
public class PhotoStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "heic");
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB

    private final Path uploadsRoot;

    public PhotoStorageService(@Value("${pawid.uploads-dir}") String uploadsDir) {
        this.uploadsRoot = Paths.get(uploadsDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void ensureUploadsDirExists() throws IOException {
        Files.createDirectories(uploadsRoot);
    }

    /**
     * Save the given file and return the generated filename (no leading slash, no path).
     * Returns null if the file is null or empty — callers should treat "no photo" as valid.
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Photo too large (max 10 MB)");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported photo type: " + extension);
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path target = uploadsRoot.resolve(filename).normalize();

        // Guard against path traversal — the resolved path must still live under uploadsRoot.
        if (!target.startsWith(uploadsRoot)) {
            throw new IllegalArgumentException("Invalid photo path");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save photo", e);
        }
        return filename;
    }

    private String extractExtension(String originalName) {
        if (originalName == null) return "";
        int dot = originalName.lastIndexOf('.');
        if (dot < 0 || dot == originalName.length() - 1) return "";
        return originalName.substring(dot + 1).toLowerCase();
    }
}
