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

export interface DatabaseSchema {
  users: User;
  dreams: Dream;
  dream_tags: DreamTag;
  dream_participants: DreamParticipant;
  tasks: Task;
  seed_wallets: SeedWallet;
  seed_transactions: SeedTransaction;
  energy_logs: EnergyLog;
}