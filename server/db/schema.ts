export interface User {
  id: number;
  email: string;
  name: string;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface Dream {
  id: number;
  user_id: number;
  title: string;
  description: string;
  location_lat: number;
  location_lng: number;
  visibility_radius: number;
  phase: 'DREAM' | 'PLAN' | 'ACT' | 'CELEBRATE';
  participant_limit: number;
  activation_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DreamTag {
  id: number;
  dream_id: number;
  tag: string;
}

export interface DreamParticipant {
  id: number;
  dream_id: number;
  user_id: number;
  joined_at: string;
}

export interface Task {
  id: number;
  dream_id: number;
  creator_id: number;
  assignee_id: number | null;
  title: string;
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  help_needed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeedWallet {
  id: number;
  user_id: number;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface SeedTransaction {
  id: number;
  from_user_id: number | null;
  to_user_id: number | null;
  amount: number;
  transaction_type: 'EARNING' | 'SPENDING' | 'POLLINATION' | 'GIFT';
  description: string | null;
  dream_id: number | null;
  created_at: string;
}

export interface EnergyLog {
  id: number;
  dream_id: number;
  health_score: number;
  collaboration_wave: number;
  diversity_gauge: number;
  recorded_at: string;
}

export interface Donor {
  id: number;
  email: string;
  name: string;
  donor_id: string;
  preferred_currency: string;
  total_donated: number;
  total_seeds_received: number;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: number;
  donation_id: string;
  donor_id: number;
  amount: number;
  currency: string;
  donation_type: 'SPECIFIC_PROJECT' | 'CATEGORY_POOL' | 'GENERAL_SEEDBANK';
  target_dream_id: number | null;
  target_category: string | null;
  seeds_generated: number;
  conversion_rate: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  donor_message: string | null;
  payment_reference: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface SeedStake {
  id: number;
  user_id: number;
  dream_id: number;
  amount: number;
  staked_at: string;
  unlock_at: string;
  pollination_points: number;
  is_active: boolean;
}

export interface DonationLink {
  id: number;
  link_id: string;
  dream_id: number | null;
  category: string | null;
  link_type: 'PROJECT' | 'CATEGORY' | 'GENERAL';
  custom_message: string | null;
  is_active: boolean;
  click_count: number;
  total_raised: number;
  created_at: string;
}

export interface SeedFlowEvent {
  id: number;
  event_type: 'DONATION' | 'TRANSFER' | 'POLLINATION' | 'STAKE' | 'UNSTAKE';
  from_entity: string | null;
  to_entity: string | null;
  amount: number;
  seeds_involved: number;
  dream_id: number | null;
  transaction_hash: string | null;
  metadata: string | null;
  created_at: string;
}

// Token Economy Interfaces
export interface UserTokens {
  id: number;
  user_id: number;
  seeds_balance: number;
  roots_balance: number;
  total_seeds_earned: number;
  total_roots_earned: number;
  last_daily_reward: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: number;
  user_id: number;
  transaction_type: 'EARN_SEEDS' | 'BURN_SEEDS' | 'CONVERT_TO_ROOTS' | 'MARKETPLACE_BUY' | 'MARKETPLACE_SELL' | 'WITHDRAW_ROOTS';
  amount: number;
  token_type: 'SEEDS' | 'ROOTS';
  description: string | null;
  burn_amount: number;
  fee_amount: number;
  created_at: string;
}

// Marketplace Interfaces
export interface MarketplaceListing {
  id: number;
  seller_id: number;
  title: string;
  description: string;
  price_seeds: number;
  category: 'PRODUCT' | 'SERVICE' | 'DIGITAL' | 'OTHER';
  subcategory: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_text: string | null;
  images: string | null;
  is_active: boolean;
  is_approved: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceTransaction {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  price_seeds: number;
  fee_seeds: number;
  seller_receives_seeds: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  buyer_rating: number | null;
  seller_rating: number | null;
  buyer_review: string | null;
  seller_review: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface UserRating {
  id: number;
  user_id: number;
  seller_rating: number;
  buyer_rating: number;
  total_sales: number;
  total_purchases: number;
  seller_reviews_count: number;
  buyer_reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface SystemConfig {
  id: number;
  config_key: string;
  config_value: string;
  description: string | null;
  updated_at: string;
}

export interface DatabaseSchema {
  users: User;
  dreams: Dream;
  dream_tags: DreamTag;
  dream_participants: DreamParticipant;
  tasks: Task;
  seed_wallets: SeedWallet;
  seed_transactions: SeedTransaction;
  energy_logs: EnergyLog;
  donors: Donor;
  donations: Donation;
  seed_stakes: SeedStake;
  donation_links: DonationLink;
  seed_flow_events: SeedFlowEvent;
  user_tokens: UserTokens;
  token_transactions: TokenTransaction;
  marketplace_listings: MarketplaceListing;
  marketplace_transactions: MarketplaceTransaction;
  user_ratings: UserRating;
  system_config: SystemConfig;
}
