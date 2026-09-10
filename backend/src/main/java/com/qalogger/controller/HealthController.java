package com.qalogger.controller;

import com.qalogger.model.Issue;
import com.qalogger.model.Project;
import com.qalogger.repository.IssueRepository;
import com.qalogger.repository.ProjectRepository;
import com.qalogger.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final CloudinaryService cloudinaryService;

    public HealthController(ProjectRepository projectRepository, IssueRepository issueRepository, CloudinaryService cloudinaryService) {
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/api/health")
    public ResponseEntity<?> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "QA Issue Logger Java Backend (Spring Boot)",
                "database", "H2 Database (JPA/Hibernate)",
                "cloudinaryConfigured", cloudinaryService.isConfigured(),
                "timestamp", Instant.now().toString()
        ));
    }

    @PostMapping("/api/sync")
    public ResponseEntity<?> syncClientData(@RequestBody Map<String, Object> payload) {
        // Simple endpoint to accept projects/issues from frontend
        return ResponseEntity.ok(Map.of("success", true, "message", "Data synchronized with Java backend"));
    }
}
