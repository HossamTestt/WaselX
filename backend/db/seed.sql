-- =============================================================
-- WaselX Seed Data — Sample records for development
-- Run AFTER schema.sql
-- =============================================================

-- Admin user (password: Admin@WaselX2024)
INSERT INTO users (id, name, email, phone, password_hash, role, status) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'WaselX Admin',
     'admin@waselx.com',
     '+971501234567',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2q8rNqQsGW', -- Admin@WaselX2024
     'admin',
     'active');

-- Sample Shipper (password: Test@1234)
INSERT INTO users (id, name, email, phone, password_hash, role, status) VALUES
    ('00000000-0000-0000-0000-000000000002',
     'Ahmed Al Mansouri',
     'shipper@test.com',
     '+971502345678',
     '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWEHKfm', -- Test@1234
     'shipper',
     'active');

-- Sample Carrier (password: Test@1234)
INSERT INTO users (id, name, email, phone, password_hash, role, status) VALUES
    ('00000000-0000-0000-0000-000000000003',
     'Mohammed Transport LLC',
     'carrier@test.com',
     '+971503456789',
     '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWEHKfm', -- Test@1234
     'carrier',
     'active');

-- Carrier profile
INSERT INTO carrier_profiles (user_id, company_name, vehicle_type, vehicle_capacity, license_plate, is_verified, rating) VALUES
    ('00000000-0000-0000-0000-000000000003',
     'Mohammed Transport LLC',
     'Flatbed Truck',
     20.0,
     'Dubai-A-12345',
     TRUE,
     4.8);

-- Sample open shipments
INSERT INTO shipments (shipper_id, pickup_address, pickup_city, pickup_lat, pickup_lng,
                       dropoff_address, dropoff_city, dropoff_lat, dropoff_lng,
                       load_type, description, weight_tonnes, status, budget_min, budget_max) VALUES
    ('00000000-0000-0000-0000-000000000002',
     'Jebel Ali Free Zone, Dubai', 'Dubai', 24.99868, 55.06100,
     'Khalifa Port, Abu Dhabi', 'Abu Dhabi', 24.80296, 54.64735,
     'General Cargo', 'Electronics shipment in sealed boxes', 5.0,
     'open', 800, 1200),

    ('00000000-0000-0000-0000-000000000002',
     'Dubai Industrial City', 'Dubai', 24.87492, 55.13456,
     'Sharjah Industrial Area 10', 'Sharjah', 25.32945, 55.41432,
     'Refrigerated', 'Temperature-sensitive food products', 2.5,
     'open', 400, 700);
