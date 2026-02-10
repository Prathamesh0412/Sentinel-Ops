package com.AutoOpsAI.backend.exception;

public class InventoryInsightsException extends RuntimeException {
    public InventoryInsightsException(String message) {
        super(message);
    }

    public InventoryInsightsException(String message, Throwable cause) {
        super(message, cause);
    }
}
