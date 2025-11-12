-- Add availability management for booking system

-- Availability slots table - defines recurring weekly availability
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Blocked dates table - for specific dates when practitioner is unavailable
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT no_past_dates CHECK (date >= CURRENT_DATE)
);

-- Booking type configuration table - defines pricing and duration for each booking type
CREATE TABLE booking_type_config (
  type booking_type PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default booking type configurations
INSERT INTO booking_type_config (type, name, description, duration_minutes, price) VALUES
  ('initial', 'Initial Consultation', 'Comprehensive health assessment and personalized treatment plan (90 minutes)', 90, 150.00),
  ('followup', 'Follow-up Consultation', 'Review progress and adjust treatment plan (45 minutes)', 45, 85.00),
  ('quick', 'Quick Consultation', 'Brief check-in or specific question (20 minutes)', 20, 50.00);

-- Insert default availability (Monday-Friday, 9 AM - 5 PM with lunch break)
INSERT INTO availability_slots (day_of_week, start_time, end_time) VALUES
  (1, '09:00:00', '12:00:00'), -- Monday morning
  (1, '13:00:00', '17:00:00'), -- Monday afternoon
  (2, '09:00:00', '12:00:00'), -- Tuesday morning
  (2, '13:00:00', '17:00:00'), -- Tuesday afternoon
  (3, '09:00:00', '12:00:00'), -- Wednesday morning
  (3, '13:00:00', '17:00:00'), -- Wednesday afternoon
  (4, '09:00:00', '12:00:00'), -- Thursday morning
  (4, '13:00:00', '17:00:00'), -- Thursday afternoon
  (5, '09:00:00', '12:00:00'), -- Friday morning
  (5, '13:00:00', '17:00:00'); -- Friday afternoon

-- Enable Row Level Security
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_type_config ENABLE ROW LEVEL SECURITY;

-- Availability slots policies (public read, admin write)
CREATE POLICY "Anyone can view active availability slots"
  ON availability_slots FOR SELECT
  USING (is_active = true);

-- Blocked dates policies (public read, admin write)
CREATE POLICY "Anyone can view blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

-- Booking type config policies (public read, admin write)
CREATE POLICY "Anyone can view active booking types"
  ON booking_type_config FOR SELECT
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_availability_slots_day ON availability_slots(day_of_week) WHERE is_active = true;
CREATE INDEX idx_blocked_dates_date ON blocked_dates(date);
CREATE INDEX idx_booking_type_config_active ON booking_type_config(is_active);

-- Create triggers for updated_at columns
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_type_config_updated_at
  BEFORE UPDATE ON booking_type_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to check if a time slot is available
CREATE OR REPLACE FUNCTION is_slot_available(
  p_date DATE,
  p_time TIME,
  p_duration_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INTEGER;
  v_end_time TIME;
  v_is_blocked BOOLEAN;
  v_has_availability BOOLEAN;
  v_has_conflict BOOLEAN;
BEGIN
  -- Calculate end time
  v_end_time := p_time + (p_duration_minutes || ' minutes')::INTERVAL;

  -- Get day of week (0 = Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Check if date is blocked
  SELECT EXISTS(
    SELECT 1 FROM blocked_dates WHERE date = p_date
  ) INTO v_is_blocked;

  IF v_is_blocked THEN
    RETURN false;
  END IF;

  -- Check if time falls within available slots
  SELECT EXISTS(
    SELECT 1
    FROM availability_slots
    WHERE day_of_week = v_day_of_week
      AND is_active = true
      AND start_time <= p_time
      AND end_time >= v_end_time
  ) INTO v_has_availability;

  IF NOT v_has_availability THEN
    RETURN false;
  END IF;

  -- Check for booking conflicts
  SELECT EXISTS(
    SELECT 1
    FROM bookings
    WHERE date = p_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        -- New booking starts during existing booking
        (p_time >= time AND p_time < time + (duration_minutes || ' minutes')::INTERVAL)
        OR
        -- New booking ends during existing booking
        (v_end_time > time AND v_end_time <= time + (duration_minutes || ' minutes')::INTERVAL)
        OR
        -- New booking completely contains existing booking
        (p_time <= time AND v_end_time >= time + (duration_minutes || ' minutes')::INTERVAL)
      )
  ) INTO v_has_conflict;

  RETURN NOT v_has_conflict;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get available time slots for a given date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_date DATE,
  p_booking_type booking_type
) RETURNS TABLE(
  time_slot TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_duration INTEGER;
  v_slot_time TIME;
  v_end_time TIME;
BEGIN
  -- Get day of week
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Get duration for booking type
  SELECT duration_minutes INTO v_duration
  FROM booking_type_config
  WHERE type = p_booking_type;

  -- Generate time slots for each availability window
  FOR v_slot_time, v_end_time IN
    SELECT
      start_time,
      end_time
    FROM availability_slots
    WHERE day_of_week = v_day_of_week
      AND is_active = true
    ORDER BY start_time
  LOOP
    -- Generate slots in 15-minute increments
    WHILE v_slot_time + (v_duration || ' minutes')::INTERVAL <= v_end_time LOOP
      RETURN QUERY
      SELECT
        v_slot_time,
        is_slot_available(p_date, v_slot_time, v_duration);

      v_slot_time := v_slot_time + INTERVAL '15 minutes';
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
