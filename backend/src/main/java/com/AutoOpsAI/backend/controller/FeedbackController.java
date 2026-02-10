package com.AutoOpsAI.backend.controller;

import com.AutoOpsAI.backend.service.LlmClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    private final LlmClientService llm;

    public FeedbackController(LlmClientService llm) {
        this.llm = llm;
    }

    @PostMapping("/email")
    public ResponseEntity<Map<String, Object>> craftEmail(@RequestBody Map<String, Object> req) {
        String text = (String) req.getOrDefault("text", "");
        Map<String, Object> result = llm.analyzeFeedback(text);
        return ResponseEntity.ok(result);
    }
}

