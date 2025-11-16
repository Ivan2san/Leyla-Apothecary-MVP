ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

CREATE INDEX IF NOT EXISTS idx_assessments_booking_id
  ON assessments(booking_id);
