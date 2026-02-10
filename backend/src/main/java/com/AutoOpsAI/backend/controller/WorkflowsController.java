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

    @PostMapping
    public ResponseEntity<Workflow> save(@RequestBody(required = false) Map<String, Object> req) {
        Workflow workflow = new Workflow();
        if (req != null) {
            if (req.containsKey("name") && req.get("name") != null) {
                workflow.setName(req.get("name").toString());
            }
            if (req.containsKey("description") && req.get("description") != null) {
                workflow.setDescription(req.get("description").toString());
            }
            // accept either `is_active` (frontend) or `active` (camelCase)
            if (req.containsKey("is_active") && req.get("is_active") != null) {
                workflow.setActive(Boolean.parseBoolean(req.get("is_active").toString()));
            } else if (req.containsKey("active") && req.get("active") != null) {
                workflow.setActive(Boolean.parseBoolean(req.get("active").toString()));
            }
        }

        if (workflow.getName() == null) workflow.setName("New Workflow");
        if (workflow.getDescription() == null) workflow.setDescription("Untitled workflow");

        return ResponseEntity.ok(repo.save(workflow));
    }
}

