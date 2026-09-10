package com.qalogger.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "issues")
public class Issue {

    @Id
    private String id;

    @Column(nullable = false)
    private String projectId;

    @Column(nullable = false)
    private Integer srNo;

    @Column(nullable = false)
    private String date;

    private String module;

    @Column(length = 4000, nullable = false)
    private String issue;

    @Column(length = 4000)
    private String expectedResult;

    @Column(length = 4000)
    private String screenshot;

    private String screenshotName;

    @Column(nullable = false)
    private String status;

    private String severity;

    @Column(length = 4000)
    private String remarks;

    private String createdAt;
    private String updatedAt;

    public Issue() {
    }

    public Issue(String id, String projectId, Integer srNo, String date, String module,
                 String issue, String expectedResult, String screenshot, String screenshotName,
                 String status, String severity, String remarks, String createdAt, String updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.srNo = srNo;
        this.date = date;
        this.module = module;
        this.issue = issue;
        this.expectedResult = expectedResult;
        this.screenshot = screenshot;
        this.screenshotName = screenshotName;
        this.status = status;
        this.severity = severity;
        this.remarks = remarks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public Integer getSrNo() {
        return srNo;
    }

    public void setSrNo(Integer srNo) {
        this.srNo = srNo;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(String expectedResult) {
        this.expectedResult = expectedResult;
    }

    public String getScreenshot() {
        return screenshot;
    }

    public void setScreenshot(String screenshot) {
        this.screenshot = screenshot;
    }

    public String getScreenshotName() {
        return screenshotName;
    }

    public void setScreenshotName(String screenshotName) {
        this.screenshotName = screenshotName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
