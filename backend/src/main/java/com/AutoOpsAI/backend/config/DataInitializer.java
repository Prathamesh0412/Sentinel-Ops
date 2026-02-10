package com.AutoOpsAI.backend.config;

import com.AutoOpsAI.backend.model.*;
import com.AutoOpsAI.backend.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.OffsetDateTime;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedData(ActionRepository actions,
                               WorkflowRepository workflows,
                               PredictionRepository predictions,
                               DataSourceRepository dataSources,
                               MetricRepository metrics) {
        return args -> {
            if (workflows.count() == 0) {
                Workflow w1 = new Workflow();
                w1.setName("customer_churn");
                w1.setDescription("Detect high-risk customers likely to churn");
                w1.setActive(true);
                w1.setExecutionCount(12);
                w1.setSuccessRate(92.0);
                w1.setLastRunAt(OffsetDateTime.now().minusDays(1));
                workflows.save(w1);

                Workflow w2 = new Workflow();
                w2.setName("inventory");
                w2.setDescription("Monitor stock levels and prevent stockouts");
                w2.setActive(true);
                w2.setExecutionCount(8);
                w2.setSuccessRate(88.0);
                w2.setLastRunAt(OffsetDateTime.now().minusHours(3));
                workflows.save(w2);
            }

            if (actions.count() == 0) {
                Action a1 = new Action();
                a1.setType("email_campaign");
                a1.setStatus("pending");
                a1.setGeneratedContent("Draft email to re-engage churn-risk customers.");
                actions.save(a1);

                Action a2 = new Action();
                a2.setType("report_generation");
                a2.setStatus("executed");
                a2.setGeneratedContent("Weekly performance report generated.");
                actions.save(a2);
            }

            if (predictions.count() == 0) {
                Prediction p1 = new Prediction();
                p1.setType("customer_churn");
                p1.setSeverity("high");
                p1.setStatus("active");
                p1.setConfidence(93.0);
                p1.setDescription("High churn risk detected for a segment of customers.");
                predictions.save(p1);
            }

            if (dataSources.count() == 0) {
                DataSource ds1 = new DataSource();
                ds1.setName("Customer DB");
                ds1.setType("customer_database");
                ds1.setStatus("completed");
                ds1.setProgress(100);
                ds1.setLastUpdated(OffsetDateTime.now().minusHours(2));
                dataSources.save(ds1);
            }

            if (metrics.count() == 0) {
                Metric m = new Metric();
                m.setTotalActions(Math.toIntExact(actions.count()));
                m.setActiveWorkflows(workflows.findByIsActive(true).size());
                m.setPredictionsGenerated(Math.toIntExact(predictions.count()));
                m.setSystemHealth(99);
                m.setAccuracyRate(94);
                m.setTimeSavedHours(12.5);
                metrics.save(m);
            }
        };
    }
}

