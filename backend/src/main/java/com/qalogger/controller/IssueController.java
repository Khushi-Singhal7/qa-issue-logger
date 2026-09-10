package com.qalogger.controller;

import com.qalogger.model.Issue;
import com.qalogger.repository.IssueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    private final IssueRepository issueRepository;

    public IssueController(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    @GetMapping
    public ResponseEntity<?> getIssuesByProject(@RequestParam(required = false) String projectId) {
        if (projectId == null || projectId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "projectId parameter is required"));
        }
        List<Issue> issues = issueRepository.findByProjectIdOrderBySrNoAsc(projectId);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/next-sr")
    public ResponseEntity<?> getNextSrNo(@RequestParam String projectId) {
        if (projectId == null || projectId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "projectId parameter is required"));
        }
        Integer nextSrNo = issueRepository.getNextSrNo(projectId);
        return ResponseEntity.ok(Map.of("nextSrNo", nextSrNo != null ? nextSrNo : 1));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssueById(@PathVariable String id) {
        return issueRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createIssue(@RequestBody Issue issue) {
        if (issue.getProjectId() == null || issue.getProjectId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "projectId is required"));
        }
        if (issue.getIssue() == null || issue.getIssue().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "issue description is required"));
        }

        String now = Instant.now().toString();
        if (issue.getId() == null || issue.getId().isBlank()) {
            issue.setId("issue-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5));
        }

        if (issue.getSrNo() == null || issue.getSrNo() < 1) {
            Integer nextSr = issueRepository.getNextSrNo(issue.getProjectId());
            issue.setSrNo(nextSr != null ? nextSr : 1);
        }

        if (issue.getDate() == null || issue.getDate().isBlank()) {
            issue.setDate(now.split("T")[0]);
        }
        if (issue.getModule() == null || issue.getModule().isBlank()) {
            issue.setModule("General");
        }
        if (issue.getStatus() == null || issue.getStatus().isBlank()) {
            issue.setStatus("Open");
        }
        if (issue.getSeverity() == null || issue.getSeverity().isBlank()) {
            issue.setSeverity("Medium");
        }
        if (issue.getExpectedResult() == null || issue.getExpectedResult().isBlank()) {
            issue.setExpectedResult("Expected to function properly without error");
        }

        if (issue.getCreatedAt() == null) {
            issue.setCreatedAt(now);
        }
        issue.setUpdatedAt(now);

        Issue saved = issueRepository.save(issue);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIssue(@PathVariable String id, @RequestBody Issue updateData) {
        return issueRepository.findById(id).map(existing -> {
            if (updateData.getSrNo() != null) existing.setSrNo(updateData.getSrNo());
            if (updateData.getDate() != null) existing.setDate(updateData.getDate());
            if (updateData.getModule() != null) existing.setModule(updateData.getModule().trim());
            if (updateData.getIssue() != null) existing.setIssue(updateData.getIssue().trim());
            if (updateData.getExpectedResult() != null) existing.setExpectedResult(updateData.getExpectedResult().trim());
            if (updateData.getScreenshot() != null) existing.setScreenshot(updateData.getScreenshot());
            if (updateData.getScreenshotName() != null) existing.setScreenshotName(updateData.getScreenshotName());
            if (updateData.getStatus() != null) existing.setStatus(updateData.getStatus());
            if (updateData.getSeverity() != null) existing.setSeverity(updateData.getSeverity());
            if (updateData.getRemarks() != null) existing.setRemarks(updateData.getRemarks().trim());

            existing.setUpdatedAt(Instant.now().toString());
            return ResponseEntity.ok(issueRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable String id) {
        if (issueRepository.existsById(id)) {
            issueRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bulk-status")
    @Transactional
    public ResponseEntity<?> bulkUpdateStatus(@RequestBody Map<String, Object> payload) {
        List<String> ids = (List<String>) payload.get("ids");
        String status = (String) payload.get("status");

        if (ids == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ids list and status are required"));
        }

        int count = 0;
        String now = Instant.now().toString();
        for (String id : ids) {
            var opt = issueRepository.findById(id);
            if (opt.isPresent()) {
                Issue issue = opt.get();
                issue.setStatus(status);
                issue.setUpdatedAt(now);
                issueRepository.save(issue);
                count++;
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "count", count));
    }

    @PostMapping("/bulk-delete")
    @Transactional
    public ResponseEntity<?> bulkDelete(@RequestBody Map<String, Object> payload) {
        List<String> ids = (List<String>) payload.get("ids");
        if (ids == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ids list is required"));
        }

        issueRepository.deleteAllById(ids);
        return ResponseEntity.ok(Map.of("success", true, "count", ids.size()));
    }
}
