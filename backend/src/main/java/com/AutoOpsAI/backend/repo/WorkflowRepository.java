package com.AutoOpsAI.backend.repo;

import com.AutoOpsAI.backend.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    List<Workflow> findByIsActive(boolean isActive);
}

