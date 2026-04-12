-- =============================================================
-- WaselX Database Schema — PostgreSQL
-- Logistics Marketplace for UAE
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- USERS TABLE
-- Stores all platform users: shippers, carriers, admins
-- =============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('shipper', 'carrier', 'admin')),
    status        VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
    -- Carriers start as 'pending' until admin approves
    -- Shippers are auto-activated
    profile_photo_url TEXT,
    fcm_token     VARCHAR(500),            -- Firebase push notification token
    uaepass_id    VARCHAR(255),            -- UAE PASS integration placeholder
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

-- =============================================================
-- CARRIER PROFILES TABLE
-- Extended profile for carriers (drivers/transport companies)
-- =============================================================
CREATE TABLE carrier_profiles (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name      VARCHAR(255),
    vehicle_type      VARCHAR(100) NOT NULL,  -- e.g. Flatbed, Refrigerated, Box Truck
    vehicle_capacity  DECIMAL(10,2),          -- in tonnes
    license_plate     VARCHAR(50),
    license_doc_url   TEXT,                   -- Driving license document
    vehicle_doc_url   TEXT,                   -- Vehicle registration
    insurance_doc_url TEXT,                   -- Insurance certificate
    trade_license_url TEXT,                   -- For companies
    is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
    rating            DECIMAL(3,2) DEFAULT 0.0,
    total_trips       INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================================
-- SHIPMENTS TABLE
-- Core entity representing a freight shipment request
-- =============================================================
CREATE TABLE shipments (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipper_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_carrier_id  UUID REFERENCES users(id),

    -- Pickup details
    pickup_address       TEXT NOT NULL,
    pickup_city          VARCHAR(100),
    pickup_lat           DECIMAL(10, 7),
    pickup_lng           DECIMAL(10, 7),

    -- Drop-off details
    dropoff_address      TEXT NOT NULL,
    dropoff_city         VARCHAR(100),
    dropoff_lat          DECIMAL(10, 7),
    dropoff_lng          DECIMAL(10, 7),

    -- Load details
    load_type            VARCHAR(100) NOT NULL, -- e.g. General, Hazardous, Refrigerated
    description          TEXT,
    weight_tonnes        DECIMAL(10, 2),
    dimensions_cbm       DECIMAL(10, 2),        -- Cubic metres (optional)

    -- Scheduling
    pickup_date          DATE,
    pickup_time_window   VARCHAR(50),           -- e.g. "08:00-12:00"

    -- Status lifecycle: open → bidding → assigned → picked_up → in_transit → delivered
    status               VARCHAR(30) NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open', 'bidding', 'assigned',
                                           'picked_up', 'in_transit', 'delivered', 'cancelled')),

    -- Pricing
    budget_min           DECIMAL(10, 2),        -- Shipper's min budget (AED)
    budget_max           DECIMAL(10, 2),        -- Shipper's max budget (AED)
    final_price          DECIMAL(10, 2),        -- Set when bid accepted
    commission_amount    DECIMAL(10, 2),        -- Platform commission deducted
    commission_rate      DECIMAL(5, 2) DEFAULT 10.0,

    -- Timestamps
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_at          TIMESTAMPTZ,
    delivered_at         TIMESTAMPTZ
);

CREATE INDEX idx_shipments_shipper ON shipments(shipper_id);
CREATE INDEX idx_shipments_carrier ON shipments(assigned_carrier_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_created ON shipments(created_at DESC);

-- =============================================================
-- BIDS TABLE
-- Carriers submit bids on open/bidding shipments
-- =============================================================
CREATE TABLE bids (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id     UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    carrier_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    price           DECIMAL(10, 2) NOT NULL,    -- Bid price in AED
    estimated_hours DECIMAL(5, 1),              -- Estimated delivery time
    note            TEXT,                        -- Carrier's message to shipper

    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One carrier can only have one active bid per shipment
    UNIQUE(shipment_id, carrier_id)
);

CREATE INDEX idx_bids_shipment ON bids(shipment_id);
CREATE INDEX idx_bids_carrier ON bids(carrier_id);
CREATE INDEX idx_bids_status ON bids(status);

-- =============================================================
-- TRACKING LOGS TABLE
-- GPS location history + status events for shipments
-- =============================================================
CREATE TABLE tracking_logs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id  UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    carrier_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lat          DECIMAL(10, 7),
    lng          DECIMAL(10, 7),
    accuracy     DECIMAL(8, 2),                 -- GPS accuracy in meters
    event_type   VARCHAR(30) NOT NULL           -- location_update | status_change
                 CHECK (event_type IN ('location_update', 'status_change')),
    status       VARCHAR(30),                   -- Status at time of event
    notes        TEXT,
    timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracking_shipment ON tracking_logs(shipment_id);
CREATE INDEX idx_tracking_timestamp ON tracking_logs(timestamp DESC);

-- =============================================================
-- PLATFORM SETTINGS TABLE
-- Admin-controlled platform configuration
-- =============================================================
CREATE TABLE platform_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       TEXT NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value, description) VALUES
    ('commission_rate', '10', 'Platform commission percentage on each shipment'),
    ('min_bid_amount', '50', 'Minimum bid amount in AED'),
    ('max_bid_count', '20', 'Maximum bids allowed per shipment'),
    ('carrier_auto_approve', 'false', 'Auto-approve carrier registrations');

-- =============================================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER carrier_profiles_updated_at BEFORE UPDATE ON carrier_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
