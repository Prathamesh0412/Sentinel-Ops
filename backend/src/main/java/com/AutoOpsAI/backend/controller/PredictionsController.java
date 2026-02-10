package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.model.Prediction;
import com.AutoOpsAI.backend.repo.PredictionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
public class PredictionsController {
    private final PredictionRepository repo;

    public PredictionsController(PredictionRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Prediction> list(@RequestParam(value = "status", required = false) String status,
                                 @RequestParam(value = "severity", required = false) String severity,
                                 @RequestParam(value = "type", required = false) String type) {
        if (status != null) return repo.findByStatus(status);
        if (severity != null) return repo.findBySeverity(severity);
        if (type != null) return repo.findByType(type);
        return repo.findAll();
    }
}

