package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.model.DataSource;
import com.AutoOpsAI.backend.repo.DataSourceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data-sources")
public class DataSourcesController {
    private final DataSourceRepository repo;

    public DataSourcesController(DataSourceRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<DataSource> list() {
        return repo.findAll();
    }

    @PostMapping
    public DataSource create(@RequestBody DataSource ds) {
        return repo.save(ds);
    }
}

