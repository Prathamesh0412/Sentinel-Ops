package com.AutoOpsAI.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "metrics")
public class Metric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_actions")
    private Integer totalActions = 0;

    @Column(name = "active_workflows")
    private Integer activeWorkflows = 0;

    @Column(name = "predictions_generated")
    private Integer predictionsGenerated = 0;

    @Column(name = "system_health")
    private Integer systemHealth = 100;

    @Column(name = "time_saved_hours")
    private Double timeSavedHours = 0.0;

    @Column(name = "accuracy_rate")
    private Integer accuracyRate = 95;

    @Column(name = "last_updated")
    private OffsetDateTime lastUpdated = OffsetDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getTotalActions() {
        return totalActions;
    }

    public void setTotalActions(Integer totalActions) {
        this.totalActions = totalActions;
    }

    public Integer getActiveWorkflows() {
        return activeWorkflows;
    }

    public void setActiveWorkflows(Integer activeWorkflows) {
        this.activeWorkflows = activeWorkflows;
    }

    public Integer getPredictionsGenerated() {
        return predictionsGenerated;
    }

    public void setPredictionsGenerated(Integer predictionsGenerated) {
        this.predictionsGenerated = predictionsGenerated;
    }

    public Integer getSystemHealth() {
        return systemHealth;
    }

    public void setSystemHealth(Integer systemHealth) {
        this.systemHealth = systemHealth;
    }

    public Double getTimeSavedHours() {
        return timeSavedHours;
    }

    public void setTimeSavedHours(Double timeSavedHours) {
        this.timeSavedHours = timeSavedHours;
    }

    public Integer getAccuracyRate() {
        return accuracyRate;
    }

    public void setAccuracyRate(Integer accuracyRate) {
        this.accuracyRate = accuracyRate;
    }

    public OffsetDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(OffsetDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}

