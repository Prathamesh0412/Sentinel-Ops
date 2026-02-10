package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.model.Prediction;
import com.AutoOpsAI.backend.repo.PredictionRepository;
import com.AutoOpsAI.backend.service.LlmClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions/generate")
public class PredictionGeneratorController {
    private final LlmClientService llm;
    private final PredictionRepository repo;

    public PredictionGeneratorController(LlmClientService llm, PredictionRepository repo) {
        this.llm = llm;
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<List<Prediction>> generate(@RequestBody Map<String, Object> payload) {
        Map<String, Object> result = llm.generatePredictions(payload);
        Object predsObj = result.get("predictions");
        if (predsObj instanceof List<?> list) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> preds = (List<Map<String, Object>>) list;
            List<Prediction> saved = preds.stream().map(m -> {
                Prediction p = new Prediction();
                p.setType((String) m.getOrDefault("type", "analytics"));
                p.setSeverity((String) m.getOrDefault("severity", "medium"));
                p.setStatus((String) m.getOrDefault("status", "active"));
                Object conf = m.get("confidence");
                p.setConfidence(conf instanceof Number ? ((Number) conf).doubleValue() : null);
                p.setDescription((String) m.getOrDefault("description", ""));
                p.setCreatedAt(OffsetDateTime.now());
                return repo.save(p);
            }).toList();
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.badRequest().build();
    }
}

