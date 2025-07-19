-- Insert demo users if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com') THEN
        INSERT INTO users (email, password, role) VALUES ('admin@example.com', 'password', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'member@example.com') THEN
        INSERT INTO users (email, password, role) VALUES ('member@example.com', 'password', 'member');
    END IF;
END $$;
