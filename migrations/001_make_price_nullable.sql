-- Make price columns nullable for bidding system
ALTER TABLE listings 
  ALTER COLUMN price_per_kg DROP NOT NULL,
  ALTER COLUMN total_price DROP NOT NULL;

-- Set default values for existing records
UPDATE listings 
SET price_per_kg = 0, total_price = 0 
WHERE price_per_kg IS NULL OR total_price IS NULL;

-- Add default values for new records
ALTER TABLE listings 
  ALTER COLUMN price_per_kg SET DEFAULT 0,
  ALTER COLUMN total_price SET DEFAULT 0;
