-- Create saved_listings table for buyers to save listings
CREATE TABLE IF NOT EXISTS "saved_listings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "buyer_id" uuid NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "listing_id" uuid NOT NULL REFERENCES "listings"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("buyer_id", "listing_id")
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "saved_listings_buyer_id_idx" ON "saved_listings"("buyer_id");
CREATE INDEX IF NOT EXISTS "saved_listings_listing_id_idx" ON "saved_listings"("listing_id");
