-- Seed workflows
INSERT INTO workflows (name, description, is_active, execution_count, success_rate, last_run_at)
VALUES
('Order Processing Workflow', 'Processes incoming orders and updates inventory', true, 42, 92.5, now()),
('Customer Followup Workflow', 'Sends follow-up emails to customers after purchase', true, 17, 88.0, now());

-- Seed predictions
INSERT INTO predictions (type, severity, status, confidence, description, created_at)
VALUES
('customer_churn', 'medium', 'active', 78.5, 'Churn risk rising in segment A. Consider targeted campaign.', now()),
('inventory', 'high', 'active', 91.2, 'Potential stockout for SKU-123 in 2 weeks. Reorder advised.', now());

-- Seed metrics (single row representing current system metrics)
INSERT INTO metrics (total_actions, active_workflows, predictions_generated, system_health, time_saved_hours, accuracy_rate, last_updated)
VALUES (124, 5, 32, 98, 256.4, 94, now());

-- Seed data sources
INSERT INTO data_sources (name, type, status, progress, last_updated)
VALUES
('Customer DB', 'customer_database', 'completed', 100, now()),
('Sales Records', 'sales_records', 'processing', 45, now());

-- Seed actions
INSERT INTO actions (type, status, generated_content, created_at, updated_at)
VALUES
('send_email', 'executed', 'Email sent to user@example.com: "Thanks for your purchase"', now(), now()),
('reorder_sku', 'pending', 'Generated reorder for SKU-123, qty 500', now(), NULL);

-- Seed workflow executions (referencing the first two workflows)
-- Note: IDs are assigned by the DB; adjust if existing rows are present.
INSERT INTO workflow_executions (workflow_id, status, duration_ms, success, timestamp)
VALUES
(1, 'success', 3200, true, now()),
(2, 'failed', 5400, false, now());
