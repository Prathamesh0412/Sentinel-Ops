package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.model.Workflow;
import com.AutoOpsAI.backend.repo.WorkflowRepository;
import com.AutoOpsAI.backend.repo.WorkflowExecutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowsController {
    private final WorkflowRepository repo;
    private final WorkflowExecutionRepository execRepo;

    public WorkflowsController(WorkflowRepository repo, WorkflowExecutionRepository execRepo) {
        this.repo = repo;
        this.execRepo = execRepo;
    }

    @GetMapping
    public List<Workflow> list() {
        return repo.findAll();
    }

    @PatchMapping
    public ResponseEntity<Workflow> toggle(@RequestBody ToggleWorkflowRequest req) {
        return repo.findById(req.id()).map(w -> {
            if (req.isActive() != null) w.setActive(req.isActive());
            return ResponseEntity.ok(repo.save(w));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> m = new HashMap<>();
        m.put("total", repo.count());
        m.put("active", repo.findByIsActive(true).size());
        m.put("executions", execRepo.count());
        return m;
    }

    public record ToggleWorkflowRequest(Long id, Boolean isActive) {}
}

