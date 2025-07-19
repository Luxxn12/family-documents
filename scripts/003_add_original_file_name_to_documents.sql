-- Add original_file_name column
ALTER TABLE documents
ADD COLUMN original_file_name TEXT;

-- Populate existing rows with a derived original_file_name based on file_type
-- This is a best-effort to ensure existing documents have a value.
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
        WHEN file_type = 'application/vnd.ms-powerpoint' THEN name || '.ppt'
        WHEN file_type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation' THEN name || '.pptx'
        WHEN file_type = 'text/plain' THEN name || '.txt'
        WHEN file_type = 'text/csv' THEN name || '.csv'
        ELSE name -- Fallback if file_type is unknown or generic
    END
WHERE original_file_name IS NULL;

-- Make the column NOT NULL after populating existing data
ALTER TABLE documents
ALTER COLUMN original_file_name SET NOT NULL;
