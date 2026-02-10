package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.model.Action;
import com.AutoOpsAI.backend.repo.ActionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/actions")
public class ActionsController {
    private final ActionRepository repo;

    public ActionsController(ActionRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Action> list(@RequestParam(value = "status", required = false) String status) {
        return status != null ? repo.findByStatus(status) : repo.findAll();
    }

    @PatchMapping
    public ResponseEntity<Action> update(@RequestBody UpdateActionRequest req) {
        return repo.findById(req.id()).map(a -> {
            if (req.status() != null) a.setStatus(req.status());
            if (req.generatedContent() != null) a.setGeneratedContent(req.generatedContent());
            a.setUpdatedAt(OffsetDateTime.now());
            return ResponseEntity.ok(repo.save(a));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record UpdateActionRequest(Long id, String status, String generatedContent) {}
}

