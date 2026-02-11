package com.AutoOpsAI.backend.repo;

import com.AutoOpsAI.backend.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepository extends JpaRepository<Action, Long> {
    List<Action> findByStatus(String status);

    long countByStatus(String status);
}

