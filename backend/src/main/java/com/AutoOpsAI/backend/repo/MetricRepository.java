package com.AutoOpsAI.backend.repo;

import com.AutoOpsAI.backend.model.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {
}

