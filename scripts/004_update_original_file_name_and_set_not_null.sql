-- 004_update_original_file_name_and_set_not_null.sql

-- Update existing rows where original_file_name is NULL
-- This handles cases where the column was added but not populated for old data
UPDATE documents
SET original_file_name =
    CASE
        WHEN file_type = 'application/pdf' THEN name || '.pdf'
        WHEN file_type = 'image/png' THEN name || '.png'
        WHEN file_type = 'image/jpeg' THEN name || '.jpg'
        WHEN file_type = 'image/gif' THEN name || '.gif'
        WHEN file_type = 'image/bmp' THEN name || '.bmp'
        WHEN file_type = 'image/webp' THEN name || '.webp'
        WHEN file_type = 'image/svg+xml' THEN name || '.svg'
        WHEN file_type = 'application/msword' THEN name || '.doc'
        WHEN file_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' THEN name || '.docx'
        WHEN file_type = 'application/vnd.ms-excel' THEN name || '.xls'
        WHEN file_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' THEN name || '.xlsx'
        WHEN file_type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation' THEN name || '.pptx'
        WHEN file_type = 'text/plain' THEN name || '.txt'
        WHEN file_type = 'text/csv' THEN name || '.csv'
        ELSE name -- Fallback if file_type is unknown or generic
    END
WHERE original_file_name IS NULL;

-- Set the column to NOT NULL if it's currently nullable
-- This uses a DO block to check if the column is nullable before attempting to alter
DO $$
DECLARE
    col_nullable boolean;
BEGIN
    SELECT is_nullable INTO col_nullable
    FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'original_file_name';

    IF col_nullable THEN
        ALTER TABLE documents
        ALTER COLUMN original_file_name SET NOT NULL;
    END IF;
END $$;
