package com.pawid.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Two jobs:
 *   1) Allow the Angular dev server (localhost:4200) to call our API.
 *   2) Serve uploaded photos as static files under /uploads/**.
 *
 * The second bit is what lets the frontend show a dog photo via a simple <img src="...">,
 * without us ever streaming bytes through a controller.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${pawid.uploads-dir}")
    private String uploadsDir;

    @Value("${pawid.cors-allowed-origins}")
    private String corsAllowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(corsAllowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map URL /uploads/** -> files inside the uploads directory on disk.
        // The trailing slash on "file:..." is important for Spring to treat it as a directory.
        String absolutePath = Paths.get(uploadsDir).toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absolutePath);
    }
}
