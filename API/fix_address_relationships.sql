-- SQL Script to fix UserAddress relationships
-- This removes the conflicting foreign key constraint

-- Drop the old foreign key that uses UserAddressId
ALTER TABLE "UserAddress" DROP CONSTRAINT IF EXISTS "FK_UserAddress_AspNetUsers_UserAddressId";

-- The UserId foreign key should already exist from the previous migration
-- If not, create it:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_UserAddress_AspNetUsers_UserId'
    ) THEN
        ALTER TABLE "UserAddress"
        ADD CONSTRAINT "FK_UserAddress_AspNetUsers_UserId"
        FOREIGN KEY ("UserId")
        REFERENCES "AspNetUsers" ("Id")
        ON DELETE CASCADE;
    END IF;
END $$;

-- Verify the constraints
SELECT conname AS constraint_name, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid = '"UserAddress"'::regclass
  AND contype = 'f';
