package com.AutoOpsAI.backend.model;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

    @Column(name = "total_customers")
    private Integer totalCustomers = 0;

    @Column(name = "active_products")
    private Integer activeProducts = 0;

    @Column(name = "total_revenue")
    private Double totalRevenue = 0.0;

    @Column(name = "pending_actions")
    private Integer pendingActions = 0;

    @Column(name = "executed_actions")
    private Integer executedActions = 0;

    @Column(name = "confidence_score")
    private Integer confidenceScore = 95;

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

    public Integer getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Integer totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Integer getActiveProducts() {
        return activeProducts;
    }

    public void setActiveProducts(Integer activeProducts) {
        this.activeProducts = activeProducts;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Integer getPendingActions() {
        return pendingActions;
    }

    public void setPendingActions(Integer pendingActions) {
        this.pendingActions = pendingActions;
    }

    public Integer getExecutedActions() {
        return executedActions;
    }

    public void setExecutedActions(Integer executedActions) {
        this.executedActions = executedActions;
    }

    public Integer getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Integer confidenceScore) {
        this.confidenceScore = confidenceScore;
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

