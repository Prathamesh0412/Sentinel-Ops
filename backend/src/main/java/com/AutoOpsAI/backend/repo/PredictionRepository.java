package com.AutoOpsAI.backend.repo;

import com.AutoOpsAI.backend.model.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByStatus(String status);
    List<Prediction> findBySeverity(String severity);
    List<Prediction> findByType(String type);
}

