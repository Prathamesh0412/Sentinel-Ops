package com.AutoOpsAI.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AnalyzeUploadResponse(
        @JsonProperty("insights") com.AutoOpsAI.backend.dto.InventoryInsightsResponse insights,
        @JsonProperty("files_processed") int filesProcessed,
        @JsonProperty("records_processed") long recordsProcessed,
        @JsonProperty("products_analyzed") int productsAnalyzed,
        @JsonProperty("summaries") List<FileAnalysisSummary> summaries
) {
}
