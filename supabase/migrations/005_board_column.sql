-- Phase 8: Add board_column field for Kanban board view
-- Values: active, consider, paused, scheduled

alter table subscriptions
add column board_column text
check (board_column in ('active', 'consider', 'paused', 'scheduled'))
default 'active';

-- Set existing paused subscriptions to paused column
update subscriptions set board_column = 'paused' where status = 'paused';

-- Set existing active subscriptions to active column
update subscriptions set board_column = 'active' where status = 'active';
