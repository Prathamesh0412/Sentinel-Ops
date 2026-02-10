package com.AutoOpsAI.backend.model;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerFeedback {

    @jakarta.persistence.Id
    @GeneratedValue
    private Long id;

    private String customerEmail;
    private String subject;

    @Lob
    private String message;

    private String sentiment; // POSITIVE, NEUTRAL, NEGATIVE

    private boolean responded;
    private Instant receivedAt;

    
}
