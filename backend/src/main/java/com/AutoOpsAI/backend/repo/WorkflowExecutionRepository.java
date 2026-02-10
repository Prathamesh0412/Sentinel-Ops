package com.AutoOpsAI.backend.repo;

import com.AutoOpsAI.backend.model.WorkflowExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, Long> {
}

