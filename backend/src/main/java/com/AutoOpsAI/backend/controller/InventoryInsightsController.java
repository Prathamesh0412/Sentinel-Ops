package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.dto.InventoryInsightsRequest;
import com.AutoOpsAI.backend.dto.InventoryInsightsResponse;
import com.AutoOpsAI.backend.exception.InventoryInsightsException;
import com.AutoOpsAI.backend.service.InventoryInsightsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory-insights")
public class InventoryInsightsController {

    private final InventoryInsightsService service;

    public InventoryInsightsController(InventoryInsightsService service) {
        this.service = service;
    }

    @GetMapping
    public InventoryInsightsResponse generateWithDefaults() {
        return service.generateInsights(null);
    }

    @PostMapping
    public InventoryInsightsResponse generateFromPayload(@RequestBody(required = false) InventoryInsightsRequest request) {
        return service.generateInsights(request);
    }

    @ExceptionHandler(InventoryInsightsException.class)
    public ResponseEntity<String> handleInventoryErrors(InventoryInsightsException exception) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(exception.getMessage());
    }
}
