package com.AutoOpsAI.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.AutoOpsAI.backend.dto.AnalyzeUploadRequest;
import com.AutoOpsAI.backend.dto.AnalyzeUploadResponse;
import com.AutoOpsAI.backend.dto.FileUploadResponse;
import com.AutoOpsAI.backend.dto.UploadedFileDescriptor;
import com.AutoOpsAI.backend.service.UploadedDataAnalysisService;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final Path uploadDir;
    private final UploadedDataAnalysisService analysisService;

    public FileUploadController(
            UploadedDataAnalysisService analysisService,
            @Value("${upload.directory:uploads}") String uploadDir) throws IOException {
        this.analysisService = analysisService;
        Path base = Path.of("").toAbsolutePath();
        Path configured = Path.of(uploadDir);
        this.uploadDir = configured.isAbsolute() ? configured : base.resolve(configured).normalize();
        Files.createDirectories(this.uploadDir);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "File upload controller is working");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/files")
    public ResponseEntity<FileUploadResponse> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        List<UploadedFileDescriptor> descriptors = new ArrayList<>();
        int errorCount = 0;

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            if (file.getSize() > MAX_FILE_SIZE) {
                errorCount++;
                continue;
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !isFileTypeAllowed(originalFilename)) {
                errorCount++;
                continue;
            }

            try {
                String storedName = buildStoredName(originalFilename);
                Path destination = uploadDir.resolve(storedName).normalize();
                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                descriptors.add(new UploadedFileDescriptor(
                        storedName,
                        originalFilename,
                        storedName,
                        file.getContentType(),
                        file.getSize(),
                        OffsetDateTime.now()
                ));
            } catch (IOException ex) {
                errorCount++;
            }
        }

        FileUploadResponse response = new FileUploadResponse(true, descriptors.size(), errorCount, descriptors);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeUploadResponse> analyzeFiles(@RequestBody AnalyzeUploadRequest request) {
        if (request == null || !request.hasFiles()) {
            return ResponseEntity.badRequest().build();
        }
        AnalyzeUploadResponse response = analysisService.analyze(request.files());
        return ResponseEntity.ok(response);
    }

    private static String buildStoredName(String originalFilename) {
        String sanitized = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String extension = "";
        int idx = sanitized.lastIndexOf('.');
        if (idx >= 0) {
            extension = sanitized.substring(idx);
        }
        return UUID.randomUUID() + extension;
    }

    private boolean isFileTypeAllowed(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".csv") || lower.endsWith(".txt") || lower.endsWith(".xls") || lower.endsWith(".xlsx");
    }
}
