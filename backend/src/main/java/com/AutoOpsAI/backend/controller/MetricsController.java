package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.model.Metric;
import com.AutoOpsAI.backend.repo.MetricRepository;
import com.AutoOpsAI.backend.repo.ActionRepository;
import com.AutoOpsAI.backend.repo.PredictionRepository;
import com.AutoOpsAI.backend.repo.WorkflowRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {
    private final MetricRepository metricRepository;
    private final ActionRepository actionRepository;
    private final PredictionRepository predictionRepository;
    private final WorkflowRepository workflowRepository;

    public MetricsController(MetricRepository metricRepository,
                             ActionRepository actionRepository,
                             PredictionRepository predictionRepository,
                             WorkflowRepository workflowRepository) {
        this.metricRepository = metricRepository;
        this.actionRepository = actionRepository;
        this.predictionRepository = predictionRepository;
        this.workflowRepository = workflowRepository;
    }

    @GetMapping
    public Metric getMetrics() {
        return metricRepository.findAll().stream().findFirst().map(m -> {
            m.setTotalActions(Math.toIntExact(actionRepository.count()));
            m.setPredictionsGenerated(Math.toIntExact(predictionRepository.count()));
            m.setActiveWorkflows(workflowRepository.findByIsActive(true).size());
            m.setLastUpdated(OffsetDateTime.now());
            return metricRepository.save(m);
        }).orElseGet(() -> {
            Metric m = new Metric();
            m.setTotalActions(Math.toIntExact(actionRepository.count()));
            m.setPredictionsGenerated(Math.toIntExact(predictionRepository.count()));
            m.setActiveWorkflows(workflowRepository.findByIsActive(true).size());
            m.setLastUpdated(OffsetDateTime.now());
            return metricRepository.save(m);
        });
    }
}

