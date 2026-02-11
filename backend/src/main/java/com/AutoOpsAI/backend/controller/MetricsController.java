package com.AutoOpsAI.backend.controller;

import java.time.OffsetDateTime;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.AutoOpsAI.backend.model.Metric;
import com.AutoOpsAI.backend.repo.ActionRepository;
import com.AutoOpsAI.backend.repo.MetricRepository;
import com.AutoOpsAI.backend.repo.PredictionRepository;
import com.AutoOpsAI.backend.repo.WorkflowRepository;

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
        return metricRepository.findAll()
                .stream()
                .findFirst()
                .map(this::refreshMetric)
                .orElseGet(() -> refreshMetric(new Metric()));
    }

    private Metric refreshMetric(Metric metric) {
        metric.setTotalActions(Math.toIntExact(actionRepository.count()));
        metric.setPredictionsGenerated(Math.toIntExact(predictionRepository.count()));
        metric.setActiveWorkflows(workflowRepository.findByIsActive(true).size());
        metric.setPendingActions(Math.toIntExact(actionRepository.countByStatus("pending")));
        metric.setExecutedActions(Math.toIntExact(actionRepository.countByStatus("executed")));
        if (metric.getTotalCustomers() == null) {
            metric.setTotalCustomers(0);
        }
        if (metric.getActiveProducts() == null) {
            metric.setActiveProducts(0);
        }
        if (metric.getTotalRevenue() == null) {
            metric.setTotalRevenue(0.0);
        }
        if (metric.getConfidenceScore() == null) {
            metric.setConfidenceScore(95);
        }
        metric.setLastUpdated(OffsetDateTime.now());
        return metricRepository.save(metric);
    }
}

