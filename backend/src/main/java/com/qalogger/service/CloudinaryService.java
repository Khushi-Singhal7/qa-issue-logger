package com.qalogger.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    private Cloudinary cloudinary;
    private boolean isConfigured = false;
    private final Path localUploadPath = Paths.get("uploads");

    @PostConstruct
    public void init() {
        try {
            if (cloudinaryUrl != null && !cloudinaryUrl.isBlank() && !cloudinaryUrl.contains("your_cloudinary_url")) {
                this.cloudinary = new Cloudinary(cloudinaryUrl);
                this.isConfigured = true;
                System.out.println("[Cloudinary Service] Initialized using cloudinary.url");
            } else if (cloudName != null && !cloudName.isBlank() && !cloudName.contains("your_cloud_name")
                    && apiKey != null && !apiKey.isBlank() && !apiKey.contains("your_api_key")
                    && apiSecret != null && !apiSecret.isBlank() && !apiSecret.contains("your_api_secret")) {
                Map<String, String> config = new HashMap<>();
                config.put("cloud_name", cloudName.trim());
                config.put("api_key", apiKey.trim());
                config.put("api_secret", apiSecret.trim());
                this.cloudinary = new Cloudinary(config);
                this.isConfigured = true;
                System.out.println("[Cloudinary Service] Initialized successfully with cloud-name: " + cloudName);
            } else {
                System.out.println("[Cloudinary Service] Credentials not yet configured in application.properties. Using local upload fallback.");
            }

            if (!Files.exists(localUploadPath)) {
                Files.createDirectories(localUploadPath);
            }
        } catch (Exception e) {
            System.err.println("[Cloudinary Service] Initialization warning: " + e.getMessage());
        }
    }

    public Map<String, Object> uploadFile(MultipartFile file) throws IOException {
        Map<String, Object> result = new HashMap<>();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided for upload");
        }

        // 1. Try uploading to Cloudinary CDN if credentials exist
        if (isConfigured && cloudinary != null) {
            try {
                Map uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto")
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                result.put("url", secureUrl);
                result.put("source", "cloudinary");
                result.put("public_id", uploadResult.get("public_id"));
                result.put("filename", file.getOriginalFilename());
                return result;
            } catch (Exception ex) {
                System.err.println("[Cloudinary] Upload failed, falling back to local storage: " + ex.getMessage());
            }
        }

        // 2. Fallback to local uploads directory
        String ext = "";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.contains(".")) {
            ext = orig.substring(orig.lastIndexOf("."));
        } else {
            ext = ".png";
        }

        String filename = "qa-screen-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + ext;
        Path target = localUploadPath.resolve(filename);
        Files.copy(file.getInputStream(), target);

        result.put("url", "/uploads/" + filename);
        result.put("source", "local");
        result.put("filename", orig != null ? orig : filename);
        return result;
    }

    public boolean isConfigured() {
        return isConfigured;
    }
}
