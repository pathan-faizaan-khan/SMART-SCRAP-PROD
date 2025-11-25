# SmartScrap Bidding System Implementation

## Overview
This update transforms SmartScrap from a fixed-price listing system to a **bidding marketplace** where:
- **Sellers** list materials with only quantity (no price)
- **Buyers** place competitive bids offering their price
- **Sellers** review all bids and choose the best offer
- **Accepted bids** automatically create orders that follow the existing OTP-based completion flow

## Database Changes

### New Table: `bids`
```sql
CREATE TABLE bids (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES user_profiles(id),
  seller_id UUID REFERENCES user_profiles(id),
  price_per_kg INTEGER NOT NULL,  -- Buyer's offered price in paise
  quantity INTEGER NOT NULL,       -- How much buyer wants (in kg)
  total_amount INTEGER NOT NULL,   -- Calculated total
  pickup_date TIMESTAMP,
  pickup_time_slot VARCHAR(50),
  payment_method VARCHAR(50),
  status bid_status DEFAULT 'pending',  -- pending, accepted, rejected, cancelled, expired
  buyer_notes TEXT,
  seller_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP
);
```

### Updated Table: `transactions`
- Added `bid_id` field to link orders to accepted bids

### New Enum: `bid_status`
- `pending` - Bid awaiting seller review
- `accepted` - Seller accepted this bid (creates order)
- `rejected` - Seller declined this bid
- `cancelled` - Buyer cancelled their bid
- `expired` - Bid expired (optional feature)

## New Features

### 1. Seller Workflow
**Creating Listings:**
- Sellers NO LONGER set prices
- Only provide: title, description, category, quantity, pickup location
- Bidding system explanation shown instead of price calculator

**Managing Bids (`/dashboard` → Bids tab):**
- View all bids received on their listings
- Filter by: all, pending, accepted, rejected
- See bid details: price/kg, quantity, total amount, buyer info, notes
- **Accept Bid** button:
  - Creates an order/transaction
  - Generates OTP for completion
  - Rejects all other pending bids automatically
  - Notifies buyer that bid was accepted
- **Reject Bid** button:
  - Declines bid with optional reason
  - Notifies buyer of rejection

### 2. Buyer Workflow
**Browsing Listings:**
- See listings without prices (price determined by bidding)
- "Place Bid" button opens bidding modal

**Placing Bids (PlaceBidModal):**
- Enter price per kg offer
- Select quantity (up to listing's max weight)
- Optional: pickup date, time slot preferences
- Optional: payment method (cash, UPI, bank transfer)
- Optional: notes to seller
- Total bid amount calculated automatically

**Viewing Bids:**
- Buyers can see their placed bids and statuses
- Notifications when bids are accepted/rejected

### 3. Order Flow (Post-Bid Acceptance)
Once seller accepts a bid:

1. **Order Created** (status: `pending`)
   - Transaction record created from bid details
   - OTP generated
   - Both parties notified

2. **Buyer Actions:**
   - Sees order in "My Orders"
   - Can accept the order (moves to `accepted`)

3. **Pickup Process:**
   - Buyer marks "Out for Pickup"
   - OTP sent to seller again

4. **Completion:**
   - Buyer enters OTP to complete
   - Listing marked as 'sold'
   - Payments/earnings recorded

## API Endpoints

### `POST /api/bids`
Create a new bid
```json
{
  "listingId": "uuid",
  "buyerId": "uuid",
  "pricePerKg": 1500,  // in paise (₹15.00/kg)
  "quantity": 25,       // kg
  "pickupDate": "2025-12-01",
  "pickupTimeSlot": "morning",
  "paymentMethod": "cash",
  "buyerNotes": "Can pickup this weekend"
}
```

### `GET /api/bids?sellerId=uuid`
Get all bids for a seller

### `GET /api/bids?buyerId=uuid`
Get all bids placed by a buyer

### `GET /api/bids?listingId=uuid`
Get all bids for a specific listing

### `PATCH /api/bids/[id]`
Accept or reject a bid
```json
{
  "status": "accepted",  // or "rejected"
  "sellerResponse": "Great offer, accepted!"
}
```

### `DELETE /api/bids/[id]`
Cancel a pending bid (buyer only)

## New Components

### For Buyers
- **`PlaceBidModal.tsx`** - Modal for placing bids on listings
  - Price input with real-time total calculation
  - Quantity selector (up to listing max)
  - Pickup preferences
  - Payment method selection

### For Sellers
- **`SellerBids.tsx`** - Dashboard tab to manage bids
  - Stats: pending, accepted, total bids
  - Filter by status
  - Bid cards showing all details
  - Accept/reject actions
  - Auto-creates orders when accepting

## Updated Components

### `NewListingModal.tsx`
- **Removed:** Price per kg input field
- **Removed:** Total price calculator
- **Added:** Bidding system explanation card
- **Changed:** Listings now created with `pricePerKg: 0` and `totalPrice: 0`

### Dashboard Navigation
- **Added:** "Bids" tab between "My Listings" and "Orders"
- Shows `SellerBids` component when selected

## Migration Steps

### Database Migration
Run this SQL to add the new table:
```sql
-- Create bid_status enum
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'expired');

-- Create bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES user_profiles(id),
  seller_id UUID NOT NULL REFERENCES user_profiles(id),
  price_per_kg INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  pickup_date TIMESTAMP,
  pickup_time_slot VARCHAR(50),
  payment_method VARCHAR(50),
  status bid_status NOT NULL DEFAULT 'pending',
  buyer_notes TEXT,
  seller_response TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Add bid_id to transactions table
ALTER TABLE transactions ADD COLUMN bid_id UUID REFERENCES bids(id);

-- Create indexes for performance
CREATE INDEX idx_bids_listing_id ON bids(listing_id);
CREATE INDEX idx_bids_buyer_id ON bids(buyer_id);
CREATE INDEX idx_bids_seller_id ON bids(seller_id);
CREATE INDEX idx_bids_status ON bids(status);
```

### Code Deployment
1. Deploy schema changes (`src/db/schema.ts`)
2. Deploy API routes (`/api/bids/...`)
3. Deploy new components (`PlaceBidModal`, `SellerBids`)
4. Deploy updated components (`NewListingModal`, `Dashboard`)

## User Experience Flow

### Complete Example

**Seller "John" lists scrap metal:**
1. Goes to Dashboard → New Listing
2. Fills: Title, Category (Metal), Quantity (50 kg), Location
3. NO price entry required
4. Submits listing (status: `active`)

**Buyers place bids:**
- **Buyer A:** Offers ₹18/kg for 50 kg = ₹900 total
- **Buyer B:** Offers ₹20/kg for 30 kg = ₹600 total
- **Buyer C:** Offers ₹22/kg for 50 kg = ₹1,100 total

**Seller reviews bids:**
1. Goes to Dashboard → Bids tab
2. Sees 3 pending bids
3. Reviews Buyer C's offer (highest total)
4. Clicks "Accept" on Buyer C's bid

**System automatically:**
- Creates order with ₹22/kg × 50kg = ₹1,100
- Generates OTP: "456123"
- Rejects Buyer A & B's bids
- Notifies Buyer C: "Your bid was accepted!"
- Notifies Seller: "Order created, OTP: 456123"

**Buyer C completes order:**
1. Sees new order in "My Orders" (pending)
2. Accepts the order
3. Marks "Out for Pickup"
4. Picks up materials
5. Enters OTP "456123" to complete
6. Listing marked as 'sold'
7. Payment recorded

## Benefits

1. **Market-Driven Pricing** - Prices determined by actual demand
2. **Seller Flexibility** - Choose best offers, not locked into fixed prices
3. **Buyer Competition** - Multiple buyers can compete for same listing
4. **Transparency** - Sellers see all offers before deciding
5. **Same Security** - OTP verification still ensures safe transactions

## Notes

- All existing features (OTP, notifications, wallet, etc.) remain functional
- Old listings with prices still work (backward compatible)
- New listings use bidding system
- Sellers can view bid history even after accepting one
- Platform commission still applies (5% default)
