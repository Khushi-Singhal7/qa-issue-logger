package com.qalogger.repository;

import com.qalogger.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, String> {

    List<Issue> findByProjectIdOrderBySrNoAsc(String projectId);

    void deleteByProjectId(String projectId);

    @Query("SELECT COALESCE(MAX(i.srNo), 0) + 1 FROM Issue i WHERE i.projectId = :projectId")
    Integer getNextSrNo(@Param("projectId") String projectId);
}
