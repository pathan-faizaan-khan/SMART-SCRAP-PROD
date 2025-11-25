import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean, integer, unique } from 'drizzle-orm/pg-core';

// Enums
export const userTypeEnum = pgEnum('user_type', ['seller', 'buyer']);
export const sellerTypeEnum = pgEnum('seller_type', ['individual', 'organization']);
export const buyerTypeEnum = pgEnum('buyer_type', ['reseller', 'scrap_company', 'recycling_factory']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);

// User Profiles Table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  userType: userTypeEnum('user_type').notNull(),
  
  // Address
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('India'),
  
  // Metadata
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Seller Profiles Table
export const sellerProfiles = pgTable('seller_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  sellerType: sellerTypeEnum('seller_type').notNull(),
  
  // For organizations
  organizationName: varchar('organization_name', { length: 255 }),
  businessRegistrationNumber: varchar('business_registration_number', { length: 100 }),
  gstNumber: varchar('gst_number', { length: 50 }),
  
  // Documents
  businessProofUrl: text('business_proof_url'),
  identityProofUrl: text('identity_proof_url'),
  addressProofUrl: text('address_proof_url'),
  
  // Payment Details (UPI for receiving payments)
  upiId: varchar('upi_id', { length: 100 }), // Primary payment method
  
  // Statistics
  totalSales: integer('total_sales').notNull().default(0),
  totalEarnings: integer('total_earnings').notNull().default(0), // in paise
  rating: integer('rating').notNull().default(0), // out of 5 stars (0-50, divide by 10 for actual rating)
  totalReviews: integer('total_reviews').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
// Buyer Profiles Table (Resellers, Scrap Companies, Recycling Factories)
export const buyerProfiles = pgTable('buyer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  buyerType: buyerTypeEnum('buyer_type').notNull(),
  
  // Company Information
  companyName: varchar('company_name', { length: 255 }).notNull(),
  companyRegistrationNumber: varchar('company_registration_number', { length: 100 }),
  taxId: varchar('tax_id', { length: 50 }),
  gstNumber: varchar('gst_number', { length: 50 }),
  
  // Business Details
  yearEstablished: integer('year_established'),
  numberOfEmployees: integer('number_of_employees'),
  annualTurnover: integer('annual_turnover'), // in lakhs
  
  // Licenses & Certifications
  tradeLicenseNumber: varchar('trade_license_number', { length: 100 }),
  environmentalClearanceNumber: varchar('environmental_clearance_number', { length: 100 }),
  
  // Documents
  companyRegistrationProofUrl: text('company_registration_proof_url'),
  tradeLicenseUrl: text('trade_license_url'),
  environmentalClearanceUrl: text('environmental_clearance_url'),
  identityProofUrl: text('identity_proof_url'),
  
  // Processing Capacity (for recycling factories)
  processingCapacityPerMonth: integer('processing_capacity_per_month'), // in kg
  
  // Bank Details
  bankAccountNumber: varchar('bank_account_number', { length: 50 }),
  bankIfscCode: varchar('bank_ifsc_code', { length: 20 }),
  bankAccountHolderName: varchar('bank_account_holder_name', { length: 255 }),
  bankName: varchar('bank_name', { length: 255 }),
  
  // Service Areas
  serviceRadius: integer('service_radius'), 
  operatingCities: text('operating_cities'), // JSON array of cities
  
  // Statistics
  totalPurchases: integer('total_purchases').notNull().default(0),
  totalSpent: integer('total_spent').notNull().default(0), // in paise
  rating: integer('rating').notNull().default(0), // out of 5 stars (0-50)
  totalReviews: integer('total_reviews').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Export types
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type NewSellerProfile = typeof sellerProfiles.$inferInsert;

export type BuyerProfile = typeof buyerProfiles.$inferSelect;
export type NewBuyerProfile = typeof buyerProfiles.$inferInsert;

// Scrap Material Categories
export const scrapCategoryEnum = pgEnum('scrap_category', [
  'plastic', 'paper', 'glass', 'cardboard', 'metal', 'electronics', 'batteries', 'textiles', 'other'
]);

export const listingStatusEnum = pgEnum('listing_status', ['draft', 'active', 'pending', 'sold', 'cancelled', 'expired']);

// Listings Table
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  // Listing Details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: scrapCategoryEnum('category').notNull(),
  
  // Quantity & Pricing
  weight: integer('weight').notNull(), // in kg
  pricePerKg: integer('price_per_kg').notNull(), // in paise
  totalPrice: integer('total_price').notNull(), // in paise
  
  // Location
  pickupAddress: text('pickup_address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  latitude: varchar('latitude', { length: 50 }),
  longitude: varchar('longitude', { length: 50 }),
  
  // Images
  images: text('images'), // JSON array of image URLs
  
  // Status & Metadata
  status: listingStatusEnum('status').notNull().default('draft'),
  viewCount: integer('view_count').notNull().default(0),
  
  // Availability
  availableFrom: timestamp('available_from'),
  availableUntil: timestamp('available_until'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
  soldAt: timestamp('sold_at'),
});

// Transaction Status
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending', 'accepted', 'pickup_scheduled', 'in_transit', 'completed', 'cancelled', 'refunded'
]);

export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded']);

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id').notNull().references(() => userProfiles.id),
  buyerId: uuid('buyer_id').notNull().references(() => userProfiles.id),
  
  // Transaction Details
  quantity: integer('quantity').notNull(), // in kg
  pricePerKg: integer('price_per_kg').notNull(), // in paise
  totalAmount: integer('total_amount').notNull(), // in paise
  
  // Commission & Fees
  platformCommission: integer('platform_commission').notNull().default(0), // in paise
  sellerAmount: integer('seller_amount').notNull(), // amount seller receives after commission
  
  // Status
  status: transactionStatusEnum('status').notNull().default('pending'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  
  // Pickup Details
  pickupAddress: text('pickup_address').notNull(),
  pickupDate: timestamp('pickup_date'),
  pickupTimeSlot: varchar('pickup_time_slot', { length: 50 }),
  
  // Payment Details
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentTransactionId: varchar('payment_transaction_id', { length: 255 }),
  
  // Notes & Communication
  buyerNotes: text('buyer_notes'),
  sellerNotes: text('seller_notes'),
  cancellationReason: text('cancellation_reason'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
});

// Wallet Table
export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  // Balance
  balance: integer('balance').notNull().default(0), // in paise
  totalEarnings: integer('total_earnings').notNull().default(0), // in paise
  totalWithdrawn: integer('total_withdrawn').notNull().default(0), // in paise
  
  // Metadata
  isActive: boolean('is_active').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Wallet Transactions
export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', [
  'credit', 'debit', 'withdrawal', 'refund', 'commission', 'bonus'
]);

export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => userProfiles.id),
  
  // Transaction Details
  type: walletTransactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // in paise
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  
  // Reference
  referenceType: varchar('reference_type', { length: 50 }), // 'transaction', 'withdrawal', etc.
  referenceId: uuid('reference_id'),
  
  // Description
  description: text('description').notNull(),
  
  // Metadata
  metadata: text('metadata'), // JSON for additional data
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Notifications
export const notificationTypeEnum = pgEnum('notification_type', [
  'listing_view', 'new_offer', 'offer_accepted', 'offer_rejected', 
  'pickup_scheduled', 'pickup_completed', 'payment_received', 
  'payment_sent', 'withdrawal_processed', 'new_message', 'account_update'
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  // Notification Details
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  // Action
  actionUrl: text('action_url'),
  actionLabel: varchar('action_label', { length: 100 }),
  
  // Reference
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  
  // Status
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  
  // Metadata
  metadata: text('metadata'), // JSON for additional data
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Reviews & Ratings
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  reviewerId: uuid('reviewer_id').notNull().references(() => userProfiles.id),
  revieweeId: uuid('reviewee_id').notNull().references(() => userProfiles.id),
  
  // Rating & Review
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  
  // Helpful
  helpfulCount: integer('helpful_count').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Export types
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// Saved Addresses Table
export const savedAddresses = pgTable('saved_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  // Address Details
  label: varchar('label', { length: 100 }).notNull(), // e.g., "Home", "Office", "Warehouse"
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  landmark: varchar('landmark', { length: 255 }),
  
  // Default address
  isDefault: boolean('is_default').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type SavedAddress = typeof savedAddresses.$inferSelect;
export type NewSavedAddress = typeof savedAddresses.$inferInsert;

// Saved Listings Table (for buyers to save listings they're interested in)
export const savedListings = pgTable('saved_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type SavedListing = typeof savedListings.$inferSelect;
export type NewSavedListing = typeof savedListings.$inferInsert;

