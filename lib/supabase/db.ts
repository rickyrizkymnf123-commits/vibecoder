import {
  UserProfile,
  ChatSession,
  ChatMessage,
  GeneratedApp,
  CreditTransaction,
  PaymentRecord,
  StorageFileItem
} from '../types';
import { supabaseAdmin } from './admin';

// ======================== USER PROFILE OPERATIONS ========================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    const { password_hash, ...profile } = data;
    const isAdmin =
      profile.username === 'demo' ||
      profile.role === 'admin' ||
      profile.email === 'demo@vibecoder.app' ||
      profile.email === 'rickyrizkymnf123@gmail.com' ||
      profile.username === 'ricky' ||
      profile.username === 'rickyrizky';
    return {
      ...profile,
      role: isAdmin ? 'admin' : (profile.role || 'user'),
      status: profile.status || 'active',
      is_approved: profile.is_approved !== undefined ? profile.is_approved : true
    } as UserProfile;
  } catch (err) {
    console.error('Failed to getUserProfile:', err);
    return null;
  }
}

export async function getUserByEmailOrUsername(
  identifier: string
): Promise<{ profile: UserProfile; passwordHash?: string } | null> {
  try {
    const norm = identifier.trim().toLowerCase();
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or(`email.ilike.${norm},username.ilike.${norm}`)
      .single();

    if (error || !data) return null;
    const { password_hash, ...profile } = data;
    const isAdmin =
      profile.username === 'demo' ||
      profile.role === 'admin' ||
      profile.email === 'demo@vibecoder.app' ||
      profile.email === 'rickyrizkymnf123@gmail.com' ||
      profile.username === 'ricky' ||
      profile.username === 'rickyrizky';
    const cleanProfile: UserProfile = {
      ...profile,
      role: isAdmin ? 'admin' : (profile.role || 'user'),
      status: profile.status || 'active',
      is_approved: profile.is_approved !== undefined ? profile.is_approved : true
    };
    return { profile: cleanProfile, passwordHash: password_hash || undefined };
  } catch (err) {
    console.error('Failed to getUserByEmailOrUsername:', err);
    return null;
  }
}

export async function createUserProfile(
  profile: Omit<UserProfile, 'created_at' | 'updated_at'>,
  passwordHash?: string
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const newRow = {
    ...profile,
    password_hash: passwordHash || null,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(newRow)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create user profile: ${error?.message}`);
  }

  const { password_hash, ...userProfile } = data;
  return userProfile as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile> & { passwordHash?: string }
): Promise<UserProfile | null> {
  try {
    const { passwordHash, ...rest } = updates;
    const updatePayload: Record<string, any> = {
      ...rest,
      updated_at: new Date().toISOString()
    };
    if (passwordHash) {
      updatePayload.password_hash = passwordHash;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) return null;
    const { password_hash, ...profile } = data;
    return profile as UserProfile;
  } catch (err) {
    console.error('Failed to updateUserProfile:', err);
    return null;
  }
}

// ======================== ADMIN USER OPERATIONS ========================

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => {
      const { password_hash, ...profile } = row;
      const isAdmin =
      profile.username === 'demo' ||
      profile.role === 'admin' ||
      profile.email === 'demo@vibecoder.app' ||
      profile.email === 'rickyrizkymnf123@gmail.com' ||
      profile.username === 'ricky' ||
      profile.username === 'rickyrizky';
      return {
        ...profile,
        role: isAdmin ? 'admin' : (profile.role || 'user'),
        status: profile.status || 'active',
        is_approved: profile.is_approved !== undefined ? profile.is_approved : true
      } as UserProfile;
    });
  } catch (err) {
    console.error('Failed to getAllUsers:', err);
    return [];
  }
}

export async function adminApproveUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'active',
        is_approved: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    return !error;
  } catch (err) {
    console.error('Failed to adminApproveUser:', err);
    return false;
  }
}

export async function adminRejectUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'rejected',
        is_approved: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    return !error;
  } catch (err) {
    console.error('Failed to adminRejectUser:', err);
    return false;
  }
}

export async function adminSetUserCredits(
  userId: string,
  appCredits: number,
  aiCredits: number,
  reason = 'Penyesuaian oleh Admin'
): Promise<{ success: boolean; app_credits: number; ai_credits: number }> {
  try {
    const user = await getUserProfile(userId);
    if (!user) throw new Error('User not found');

    const newApp = Math.max(0, Math.round(appCredits));
    const newAi = Math.max(0, Math.round(aiCredits));
    const now = new Date().toISOString();

    await supabaseAdmin
      .from('profiles')
      .update({
        app_credits: newApp,
        ai_credits: newAi,
        updated_at: now
      })
      .eq('id', userId);

    // Record audit trail
    const txIdApp = `tx-app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await supabaseAdmin.from('credit_transactions').insert({
      id: txIdApp,
      user_id: userId,
      type: 'app_credit',
      amount: newApp - user.app_credits,
      reason: `${reason} (Kredit App)`,
      balance_after: newApp,
      created_at: now
    });

    const txIdAi = `tx-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await supabaseAdmin.from('credit_transactions').insert({
      id: txIdAi,
      user_id: userId,
      type: 'ai_credit',
      amount: newAi - user.ai_credits,
      reason: `${reason} (Kredit AI)`,
      balance_after: newAi,
      created_at: now
    });

    return { success: true, app_credits: newApp, ai_credits: newAi };
  } catch (err) {
    console.error('Failed to adminSetUserCredits:', err);
    return { success: false, app_credits: 0, ai_credits: 0 };
  }
}

export async function adminDeleteUser(userId: string): Promise<boolean> {
  try {
    const user = await getUserProfile(userId);
    if (user && (user.username === 'demo' || user.role === 'admin')) {
      throw new Error('Tidak dapat menghapus akun Administrator');
    }

    await supabaseAdmin.from('chat_messages').delete().eq('session_id', userId);
    await supabaseAdmin.from('chat_sessions').delete().eq('user_id', userId);
    await supabaseAdmin.from('apps').delete().eq('user_id', userId);
    await supabaseAdmin.from('credit_transactions').delete().eq('user_id', userId);
    await supabaseAdmin.from('payments').delete().eq('user_id', userId);
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    return !error;
  } catch (err) {
    console.error('Failed to adminDeleteUser:', err);
    return false;
  }
}

export async function adminBulkDeleteUsers(userIds: string[]): Promise<{ deletedCount: number; errors: string[] }> {
  let deletedCount = 0;
  const errors: string[] = [];

  for (const id of userIds) {
    try {
      const user = await getUserProfile(id);
      if (user && (user.username === 'demo' || user.role === 'admin')) {
        errors.push(`Akun admin (${user.username}) dilindungi dari penghapusan massal.`);
        continue;
      }
      const ok = await adminDeleteUser(id);
      if (ok) deletedCount++;
      else errors.push(`Gagal menghapus user ID: ${id}`);
    } catch (e: any) {
      errors.push(e.message || `Error pada user ID: ${id}`);
    }
  }

  return { deletedCount, errors };
}

// ======================== CREDIT OPERATIONS ========================

export async function deductAppCredit(
  userId: string,
  reason = 'publish_app'
): Promise<{ success: boolean; balance: number }> {
  const user = await getUserProfile(userId);
  if (!user || user.app_credits < 1) {
    return { success: false, balance: user ? user.app_credits : 0 };
  }

  const newBalance = user.app_credits - 1;
  const now = new Date().toISOString();

  await supabaseAdmin
    .from('profiles')
    .update({ app_credits: newBalance, updated_at: now })
    .eq('id', userId);

  const txId = `tx-app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await supabaseAdmin.from('credit_transactions').insert({
    id: txId,
    user_id: userId,
    type: 'app_credit',
    amount: -1,
    reason,
    balance_after: newBalance,
    created_at: now
  });

  return { success: true, balance: newBalance };
}

export async function deductAiCredit(
  userId: string,
  tokens: number,
  reason = 'ai_chat'
): Promise<{ success: boolean; balance: number }> {
  const user = await getUserProfile(userId);
  if (!user) return { success: false, balance: 0 };

  const deduction = Math.max(1, Math.round(tokens));
  if (user.ai_credits < deduction) {
    return { success: false, balance: user.ai_credits };
  }

  const newBalance = user.ai_credits - deduction;
  const now = new Date().toISOString();

  await supabaseAdmin
    .from('profiles')
    .update({ ai_credits: newBalance, updated_at: now })
    .eq('id', userId);

  const txId = `tx-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await supabaseAdmin.from('credit_transactions').insert({
    id: txId,
    user_id: userId,
    type: 'ai_credit',
    amount: -deduction,
    reason,
    balance_after: newBalance,
    created_at: now
  });

  return { success: true, balance: newBalance };
}

export async function addAppCredits(
  userId: string,
  count: number,
  reason = 'topup_midtrans'
): Promise<UserProfile | null> {
  const user = await getUserProfile(userId);
  if (!user) return null;

  const newBalance = user.app_credits + count;
  const now = new Date().toISOString();

  const { data } = await supabaseAdmin
    .from('profiles')
    .update({ app_credits: newBalance, updated_at: now })
    .eq('id', userId)
    .select()
    .single();

  const txId = `tx-app-add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await supabaseAdmin.from('credit_transactions').insert({
    id: txId,
    user_id: userId,
    type: 'app_credit',
    amount: count,
    reason,
    balance_after: newBalance,
    created_at: now
  });

  if (!data) return null;
  const { password_hash, ...profile } = data;
  return profile as UserProfile;
}

export async function addAiCredits(
  userId: string,
  tokens: number,
  reason = 'topup_midtrans'
): Promise<UserProfile | null> {
  const user = await getUserProfile(userId);
  if (!user) return null;

  const newBalance = user.ai_credits + tokens;
  const now = new Date().toISOString();

  const { data } = await supabaseAdmin
    .from('profiles')
    .update({ ai_credits: newBalance, updated_at: now })
    .eq('id', userId)
    .select()
    .single();

  const txId = `tx-ai-add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await supabaseAdmin.from('credit_transactions').insert({
    id: txId,
    user_id: userId,
    type: 'ai_credit',
    amount: tokens,
    reason,
    balance_after: newBalance,
    created_at: now
  });

  if (!data) return null;
  const { password_hash, ...profile } = data;
  return profile as UserProfile;
}

export async function upgradeToPro(userId: string, days = 30): Promise<UserProfile | null> {
  const user = await getUserProfile(userId);
  if (!user) return null;

  const currentExpiry = user.pro_until ? new Date(user.pro_until).getTime() : Date.now();
  const baseTime = Math.max(Date.now(), currentExpiry);
  const pro_until = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data } = await supabaseAdmin
    .from('profiles')
    .update({ is_pro: true, pro_until, updated_at: now })
    .eq('id', userId)
    .select()
    .single();

  if (!data) return null;
  const { password_hash, ...profile } = data;
  return profile as UserProfile;
}

export async function getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
  const { data, error } = await supabaseAdmin
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as CreditTransaction[];
}

// ======================== CHAT SESSIONS & MESSAGES ========================

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data as ChatSession[];
  } catch (err) {
    console.error('Failed to getChatSessions:', err);
    return [];
  }
}

export async function getChatSessionById(sessionId: string): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !data) return null;
    return data as ChatSession;
  } catch (err) {
    console.error('Failed to getChatSessionById:', err);
    return null;
  }
}

export async function createChatSession(
  userId: string,
  title: string,
  app_slug?: string
): Promise<ChatSession> {
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: `ses-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    title,
    app_slug: app_slug || null,
    status: 'active',
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabaseAdmin
    .from('chat_sessions')
    .insert(session)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create chat session: ${error?.message}`);
  }
  return data as ChatSession;
}

export async function updateChatSession(
  sessionId: string,
  updates: Partial<ChatSession>
): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error || !data) return null;
    return data as ChatSession;
  } catch (err) {
    console.error('Failed to updateChatSession:', err);
    return null;
  }
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((m: any) => ({
      ...m,
      tool_calls: Array.isArray(m.tool_calls) ? m.tool_calls : [],
      todo_list: Array.isArray(m.todo_list) ? m.todo_list : []
    })) as ChatMessage[];
  } catch (err) {
    console.error('Failed to getChatMessages:', err);
    return [];
  }
}

export async function createChatMessage(
  msg: Omit<ChatMessage, 'id' | 'created_at'>
): Promise<ChatMessage> {
  const now = new Date().toISOString();
  const message: ChatMessage = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tool_calls: msg.tool_calls || [],
    todo_list: msg.todo_list || [],
    created_at: now
  };

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert(message)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create chat message: ${error?.message}`);
  }

  // Update session updated_at
  await supabaseAdmin
    .from('chat_sessions')
    .update({ updated_at: now })
    .eq('id', msg.session_id);

  return data as ChatMessage;
}

export async function deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Failed to deleteChatSession:', err);
    return false;
  }
}

export async function deleteAllChatSessions(userId: string): Promise<number> {
  try {
    const sessions = await getChatSessions(userId);
    const count = sessions.length;
    if (count > 0) {
      await supabaseAdmin
        .from('chat_sessions')
        .delete()
        .eq('user_id', userId);
    }
    return count;
  } catch (err) {
    console.error('Failed to deleteAllChatSessions:', err);
    return 0;
  }
}

// ======================== APPS ========================

export async function getApps(userId: string): Promise<GeneratedApp[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data as GeneratedApp[];
  } catch (err) {
    console.error('Failed to getApps:', err);
    return [];
  }
}

export async function getAppBySlug(slug: string): Promise<GeneratedApp | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as GeneratedApp;
  } catch (err) {
    console.error('Failed to getAppBySlug:', err);
    return null;
  }
}

export async function getAppByCustomDomain(domain: string): Promise<GeneratedApp | null> {
  try {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const { data, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('custom_domain', clean)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as GeneratedApp;
  } catch (err) {
    console.error('Failed to getAppByCustomDomain:', err);
    return null;
  }
}

export async function getAppById(appId: string): Promise<GeneratedApp | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('id', appId)
      .single();

    if (error || !data) return null;
    return data as GeneratedApp;
  } catch (err) {
    console.error('Failed to getAppById:', err);
    return null;
  }
}

export async function saveApp(
  app: Omit<GeneratedApp, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<GeneratedApp> {
  const now = new Date().toISOString();
  const id = app.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const record = {
    ...app,
    id,
    files: app.files || {},
    created_at: now,
    updated_at: now
  };

  let { data, error } = await supabaseAdmin
    .from('apps')
    .upsert(record, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    let retryNeeded = false;
    if (error.message?.includes('apps_session_id_fkey')) {
      record.session_id = null;
      retryNeeded = true;
    }
    if (error.message?.includes('apps_user_id_fkey')) {
      const { data: firstProfile } = await supabaseAdmin.from('profiles').select('id').limit(1).single();
      if (firstProfile?.id) record.user_id = firstProfile.id;
      retryNeeded = true;
    }
    if (retryNeeded) {
      if (record.session_id) {
        const { data: sess } = await supabaseAdmin.from('chat_sessions').select('id').eq('id', record.session_id).single();
        if (!sess) record.session_id = null;
      }
      const retry = await supabaseAdmin
        .from('apps')
        .upsert(record, { onConflict: 'id' })
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }
  }

  if (error || !data) {
    throw new Error(`Failed to save app: ${error?.message}`);
  }
  return data as GeneratedApp;
}

export async function updateApp(
  appId: string,
  updates: Partial<GeneratedApp>
): Promise<GeneratedApp | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('apps')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', appId)
      .select()
      .single();

    if (error || !data) return null;
    return data as GeneratedApp;
  } catch (err) {
    console.error('Failed to updateApp:', err);
    return null;
  }
}

export async function deleteApp(appId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('apps')
      .delete()
      .eq('id', appId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to deleteApp:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in deleteApp:', err);
    return false;
  }
}

// ======================== PAYMENTS ========================

export async function createPayment(
  payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentRecord> {
  const now = new Date().toISOString();
  const record: PaymentRecord = {
    ...payment,
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert(record)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create payment: ${error?.message}`);
  }
  return data as PaymentRecord;
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) return null;
    return data as PaymentRecord;
  } catch (err) {
    console.error('Failed to getPaymentByOrderId:', err);
    return null;
  }
}

export async function updatePayment(
  orderId: string,
  updates: Partial<PaymentRecord>
): Promise<PaymentRecord | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error || !data) return null;
    return data as PaymentRecord;
  } catch (err) {
    console.error('Failed to updatePayment:', err);
    return null;
  }
}

// ======================== STORAGE (PRO) ========================

export async function getStorageFiles(userId: string): Promise<StorageFileItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('storage_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      size: item.size_bytes,
      mime_type: item.mime_type,
      url: item.url,
      created_at: item.created_at
    }));
  } catch (err) {
    console.error('Failed to getStorageFiles:', err);
    return [];
  }
}

export async function addStorageFile(
  userId: string,
  file: Omit<StorageFileItem, 'id' | 'created_at'>
): Promise<StorageFileItem> {
  const now = new Date().toISOString();
  const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const row = {
    id,
    user_id: userId,
    name: file.name,
    size_bytes: file.size || 0,
    mime_type: file.mime_type || 'application/octet-stream',
    url: file.url,
    created_at: now
  };

  const { data, error } = await supabaseAdmin
    .from('storage_files')
    .insert(row)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to add storage file: ${error?.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    size: data.size_bytes,
    mime_type: data.mime_type,
    url: data.url,
    created_at: data.created_at
  };
}

export async function deleteStorageFile(userId: string, fileId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('storage_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Failed to deleteStorageFile:', err);
    return false;
  }
}

