package com.zenith.controller;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
public class FileUploadController {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize upload directory: " + uploadDir, e);
        }
    }

    /**
     * Upload an image or file manually
     */
    @PostMapping("/api/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file cannot be empty"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "upload_" + System.currentTimeMillis() + ".jpg";
        }

        // Clean file name
        String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = System.currentTimeMillis() + "_" + cleanName;

        try {
            Path targetLocation = uploadDir.resolve(uniqueFileName).normalize();
            
            // Security check against directory traversal
            if (!targetLocation.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid file name path traversal attempt"));
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/uploads/" + uniqueFileName;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "File uploaded successfully");
            response.put("fileName", uniqueFileName);
            response.put("originalName", originalFilename);
            response.put("url", fileUrl);
            response.put("size", file.getSize());
            response.put("contentType", file.getContentType());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not store file: " + ex.getMessage()));
        }
    }

    /**
     * Serve uploaded files and images
     */
    @GetMapping({"/api/uploads/{fileName:.+}", "/uploads/{fileName:.+}"})
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            Path filePath = uploadDir.resolve(fileName).normalize();
            if (!filePath.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    if (fileName.toLowerCase().endsWith(".png")) contentType = "image/png";
                    else if (fileName.toLowerCase().endsWith(".webp")) contentType = "image/webp";
                    else if (fileName.toLowerCase().endsWith(".gif")) contentType = "image/gif";
                    else if (fileName.toLowerCase().endsWith(".svg")) contentType = "image/svg+xml";
                    else contentType = "image/jpeg";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * List all uploaded files in the media library
     */
    @GetMapping("/api/uploads")
    public ResponseEntity<List<Map<String, Object>>> listFiles() {
        if (!Files.exists(uploadDir)) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        try (Stream<Path> stream = Files.list(uploadDir)) {
            List<Map<String, Object>> files = stream
                    .filter(Files::isRegularFile)
                    .map(path -> {
                        Map<String, Object> map = new HashMap<>();
                        String name = path.getFileName().toString();
                        map.put("fileName", name);
                        map.put("url", "/api/uploads/" + name);
                        try {
                            map.put("size", Files.size(path));
                            map.put("lastModified", Files.getLastModifiedTime(path).toMillis());
                        } catch (IOException e) {
                            map.put("size", 0L);
                            map.put("lastModified", System.currentTimeMillis());
                        }
                        return map;
                    })
                    .sorted((a, b) -> Long.compare((Long) b.get("lastModified"), (Long) a.get("lastModified")))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(files);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete an uploaded file
     */
    @DeleteMapping("/api/uploads/{fileName:.+}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        try {
            Path filePath = uploadDir.resolve(fileName).normalize();
            if (!filePath.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().build();
            }

            if (Files.deleteIfExists(filePath)) {
                return ResponseEntity.ok(Map.of("message", "File deleted successfully", "fileName", fileName));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not delete file: " + e.getMessage()));
        }
    }
}
