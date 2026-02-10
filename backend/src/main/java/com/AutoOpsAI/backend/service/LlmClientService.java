package com.AutoOpsAI.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class LlmClientService {
    private final RestClient restClient;

    public LlmClientService(@Value("${llm.service.url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public Map<String, Object> analyzeFeedback(String text) {
        return restClient.post()
                .uri("/analyze/feedback")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("text", text))
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> generatePredictions(Map<String, Object> payload) {
        return restClient.post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }
}

