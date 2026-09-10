export interface UserProfile {
  id: string;
  email: string;
  username: string;
  subdomain: string;
  app_credits: number;
  ai_credits: number;
  is_pro: boolean;
  pro_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  app_slug?: string | null;
  status: 'active' | 'building' | 'deployed' | 'failed' | 'draft_ready';
  created_at: string;
  updated_at: string;
}

export interface ToolCallItem {
  id: string;
  tool: string; // e.g. 'write_file', 'run_typecheck', 'run_tests', 'deploy_vercel'
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: Record<string, any> | string;
  output?: Record<string, any> | string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  active?: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls: ToolCallItem[];
  todo_list: TodoItem[];
  created_at: string;
}

export interface GeneratedApp {
  id: string;
  user_id: string;
  session_id?: string | null;
  name: string;
  slug: string;
  status: 'draft' | 'deploying' | 'published' | 'failed';
  vercel_id?: string | null;
  vercel_url?: string | null;
  custom_domain?: string | null;
  domain_status?: 'pending_verification' | 'active' | 'failed' | null;
  files: Record<string, string>; // filepath -> content
  db_schema_name?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: 'app_credit' | 'ai_credit';
  amount: number; // positive for topup, negative for deduction
  reason: string;
  balance_after: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  item_type: 'app_credit_bundle' | 'ai_credit_topup' | 'pro_subscription';
  status: 'pending' | 'settlement' | 'expire' | 'cancel' | 'failed';
  snap_token?: string | null;
  snap_redirect_url?: string | null;
  raw_payload?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StorageFileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  url: string;
  created_at: string;
}
