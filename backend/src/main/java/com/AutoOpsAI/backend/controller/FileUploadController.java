package com.AutoOpsAI.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "File upload controller is working");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/files")
    public ResponseEntity<Map<String, Object>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            int successCount = 0;
            int errorCount = 0;
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }

                // Validate file size
                if (file.getSize() > MAX_FILE_SIZE) {
                    errorCount++;
                    continue;
                }

                // Validate file type
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null || !isFileTypeAllowed(originalFilename)) {
                    errorCount++;
                    continue;
                }

                try {
                    // Generate unique filename
                    String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
                    Path filePath = uploadPath.resolve(uniqueFilename);
                    
                    // Save file
                    Files.copy(file.getInputStream(), filePath);
                    successCount++;
                    
                } catch (IOException e) {
                    errorCount++;
                }
            }

            response.put("success", true);
            response.put("message", "Files processed successfully");
            response.put("successCount", successCount);
            response.put("errorCount", errorCount);
            response.put("totalFiles", files.length);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Upload failed: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processFiles(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Simulate file processing
            // In a real implementation, this would parse the uploaded files
            // and update the database with product data
            
            response.put("success", true);
            response.put("message", "Files processed successfully");
            response.put("recordsProcessed", 150);
            response.put("insightsGenerated", 12);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Processing failed: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    private boolean isFileTypeAllowed(String filename) {
        String lowerCaseFilename = filename.toLowerCase();
        return lowerCaseFilename.endsWith(".csv") ||
               lowerCaseFilename.endsWith(".xls") ||
               lowerCaseFilename.endsWith(".xlsx") ||
               lowerCaseFilename.endsWith(".json");
    }
}
