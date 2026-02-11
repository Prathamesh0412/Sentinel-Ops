package com.AutoOpsAI.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AnalyzeUploadRequest(
        @JsonProperty("files") List<FileReference> files
) {
    public boolean hasFiles() {
        return files != null && !files.isEmpty();
    }

    public record FileReference(
            @JsonProperty("stored_name") String storedName,
            @JsonProperty("original_name") String originalName
    ) {
    }
}
