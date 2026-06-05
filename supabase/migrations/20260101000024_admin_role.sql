-- ALTER TYPE ADD VALUE commits immediately and cannot be used in the same
-- transaction. This file contains only the enum extension so the new value
-- is visible to the next migration.
ALTER TYPE user_role ADD VALUE 'admin';
