package com.AutoOpsAI.backend.service;

import com.AutoOpsAI.backend.dto.InventoryInsightsRequest;
import com.AutoOpsAI.backend.dto.InventoryInsightsResponse;
import com.AutoOpsAI.backend.exception.InventoryInsightsException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryInsightsService {

    private final ObjectMapper objectMapper;
    private final String pythonCommand;
    private final Path scriptPath;
    private final Path workingDir;

    public InventoryInsightsService(
            ObjectMapper objectMapper,
            @Value("${ml.inventory.python-command:python}") String pythonCommand,
            @Value("${ml.inventory.script-path:../model/logic.py}") String scriptPath) {
        this.objectMapper = objectMapper;
        this.pythonCommand = pythonCommand;
        Path base = Paths.get("").toAbsolutePath();
        Path configured = Paths.get(scriptPath);
        this.scriptPath = configured.isAbsolute() ? configured : base.resolve(configured).normalize();
        this.workingDir = base;
    }

    public InventoryInsightsResponse generateInsights(InventoryInsightsRequest request) {
        if (!Files.exists(scriptPath)) {
            throw new InventoryInsightsException("ML script not found at " + scriptPath);
        }

        List<String> command = new ArrayList<>();
        command.add(pythonCommand);
        command.add(scriptPath.toString());
        command.add("--output-format=json");

        Path tempInput = null;
        try {
            if (request != null && request.hasPayload()) {
                tempInput = Files.createTempFile("inventory-input", ".json");
                objectMapper.writeValue(tempInput.toFile(), request);
                command.add("--input-file");
                command.add(tempInput.toAbsolutePath().toString());
            }

            ProcessBuilder builder = new ProcessBuilder(command);
            builder.directory(workingDir.toFile());
            Process process = builder.start();

            String stdout = readAll(process.getInputStream());
            String stderr = readAll(process.getErrorStream());
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new InventoryInsightsException("ML model exited with code " + exitCode + ": " + stderr.strip());
            }

            if (stdout == null || stdout.isBlank()) {
                throw new InventoryInsightsException("ML model returned no data");
            }

            return objectMapper.readValue(stdout, InventoryInsightsResponse.class);
        } catch (IOException ex) {
            throw new InventoryInsightsException("Unable to run ML model: " + ex.getMessage(), ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new InventoryInsightsException("ML execution interrupted", ex);
        } finally {
            if (tempInput != null) {
                try {
                    Files.deleteIfExists(tempInput);
                } catch (IOException ignored) {
                    // best effort cleanup
                }
            }
        }
    }

    private static String readAll(InputStream stream) throws IOException {
        return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
    }
}
