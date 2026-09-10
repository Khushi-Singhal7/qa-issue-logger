package com.qalogger.controller;

import com.qalogger.model.Project;
import com.qalogger.repository.IssueRepository;
import com.qalogger.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;

    public ProjectController(ProjectRepository projectRepository, IssueRepository issueRepository) {
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Project project) {
        if (project.getName() == null || project.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Project name is required"));
        }

        String now = Instant.now().toString();
        if (project.getId() == null || project.getId().isBlank()) {
            project.setId("proj-" + System.currentTimeMillis());
        }
        if (project.getPrefix() == null || project.getPrefix().isBlank()) {
            project.setPrefix("QA");
        }
        project.setPrefix(project.getPrefix().trim().toUpperCase());
        if (project.getCreatedAt() == null) {
            project.setCreatedAt(now);
        }
        project.setUpdatedAt(now);

        Project saved = projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable String id, @RequestBody Project project) {
        return projectRepository.findById(id).map(existing -> {
            if (project.getName() != null && !project.getName().isBlank()) {
                existing.setName(project.getName().trim());
            }
            if (project.getPrefix() != null && !project.getPrefix().isBlank()) {
                existing.setPrefix(project.getPrefix().trim().toUpperCase());
            }
            if (project.getDescription() != null) {
                existing.setDescription(project.getDescription().trim());
            }
            existing.setUpdatedAt(Instant.now().toString());
            return ResponseEntity.ok(projectRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        if (projectRepository.existsById(id)) {
            issueRepository.deleteByProjectId(id);
            projectRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        }
        return ResponseEntity.notFound().build();
    }
}
