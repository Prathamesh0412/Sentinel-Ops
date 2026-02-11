package com.AutoOpsAI.backend.dto;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UploadedFileDescriptor(
        @JsonProperty("id") String id,
        @JsonProperty("original_name") String originalName,
        @JsonProperty("stored_name") String storedName,
        @JsonProperty("mime_type") String mimeType,
        @JsonProperty("size") long size,
        @JsonProperty("uploaded_at") OffsetDateTime uploadedAt
) {
}
