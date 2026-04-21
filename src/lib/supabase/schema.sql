-- ZyroCabs Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cars Table
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_type TEXT NOT NULL,
    image_url TEXT,
    image_hint TEXT,
    capacity INTEGER DEFAULT 4,
    one_way_rate NUMERIC DEFAULT 0,
    round_trip_rate NUMERIC DEFAULT 0,
    airport_transfer_rate NUMERIC DEFAULT 0,
    driver_allowance NUMERIC DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid UUID REFERENCES auth.users(id), -- Only for registered users
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    bookings_count INTEGER DEFAULT 0,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, -- Using custom ZC... ID format
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_uid UUID REFERENCES auth.users(id),
    pickup_location TEXT NOT NULL,
    drop_location TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    car_type TEXT,
    passengers INTEGER,
    pickup_date TEXT,
    pickup_time TEXT,
    ride_type TEXT,
    estimated_fare NUMERIC,
    sub_total NUMERIC,
    toll_charges NUMERIC DEFAULT 0,
    taxes TEXT, -- Stored as JSON string to match legacy
    driver_name TEXT,
    driver_no TEXT,
    car_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    feedback TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT,
    image_url TEXT NOT NULL,
    image_hint TEXT,
    is_banner BOOLEAN DEFAULT TRUE,
    redirect_url TEXT,
    object_fit TEXT DEFAULT 'cover',
    bg_color TEXT,
    duration INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    uid UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'User', -- Admin, Sub-Admin, User
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Web Logins Table (Tracking)
CREATE TABLE IF NOT EXISTS web_logins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    photo_url TEXT,
    device_name TEXT,
    device_type TEXT, -- Desktop, Mobile, Tablet
    location TEXT,
    ip_address TEXT,
    time_spent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Counters Table (for custom IDs)
CREATE TABLE IF NOT EXISTS counters (
    id TEXT PRIMARY KEY,
    last_number INTEGER DEFAULT 0,
    year INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Config Table
CREATE TABLE IF NOT EXISTS config (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies

-- Public Read for Cars, Feedbacks, Banners
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to cars" ON cars FOR SELECT USING (true);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to feedbacks" ON feedbacks FOR SELECT USING (true);
CREATE POLICY "Allow public insert for feedbacks" ON feedbacks FOR INSERT WITH CHECK (true);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to banners" ON banners FOR SELECT USING (true);

-- Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookings" ON bookings 
    FOR SELECT USING (auth.uid() = customer_uid);
CREATE POLICY "Admins can view all bookings" ON bookings 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles WHERE roles.uid = auth.uid() AND (roles.role = 'Admin' OR roles.role = 'Sub-Admin')
        )
    );

-- Roles RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own role" ON roles FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Admins can view all roles" ON roles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM roles r WHERE r.uid = auth.uid() AND r.role = 'Admin'
    )
);

-- RPC for atomic counter increment
CREATE OR REPLACE FUNCTION increment_counter(counter_id TEXT, current_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    next_val INTEGER;
BEGIN
    INSERT INTO counters (id, last_number, year)
    VALUES (counter_id, 1, current_year)
    ON CONFLICT (id) DO UPDATE
    SET last_number = CASE 
        WHEN counters.year = current_year THEN counters.last_number + 1 
        ELSE 1 
    END,
    year = current_year,
    updated_at = NOW()
    RETURNING last_number INTO next_val;
    
    RETURN next_val;
END;
$$ LANGUAGE plpgsql;
