package com.AutoOpsAI.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record FileUploadResponse(
        @JsonProperty("success") boolean success,
        @JsonProperty("successCount") int successCount,
        @JsonProperty("errorCount") int errorCount,
        @JsonProperty("files") List<UploadedFileDescriptor> files
) {
}
