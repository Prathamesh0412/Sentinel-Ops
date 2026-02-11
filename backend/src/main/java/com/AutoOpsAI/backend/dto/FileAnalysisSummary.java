package com.AutoOpsAI.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FileAnalysisSummary(
        @JsonProperty("stored_name") String storedName,
        @JsonProperty("original_name") String originalName,
        @JsonProperty("records_parsed") long recordsParsed
) {
}
