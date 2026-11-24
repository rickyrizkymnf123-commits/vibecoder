import { supabaseAdmin } from '../supabase/admin';
import {
  DEFAULT_MAINTENANCE_MESSAGE,
  MAINTENANCE_ROW_ID,
  MaintenanceState,
  invalidateMaintenanceCache,
  readMaintenanceState
} from './shared';

export async function getMaintenanceState(): Promise<MaintenanceState> {
  return readMaintenanceState({ fresh: true });
}

/** Simpan status ke Supabase (storage_files), pola yang sama dengan ai_config. Melempar error bila gagal tersimpan. */
export async function saveMaintenanceState(input: { enabled: boolean; message?: string; updatedBy?: string; userId?: string }): Promise<MaintenanceState> {
  const state: MaintenanceState = {
    enabled: Boolean(input.enabled),
    message: (input.message ?? '').trim().slice(0, 1000) || DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy
  };
  const payload = JSON.stringify(state);
  const { error } = await supabaseAdmin.from('storage_files').upsert(
    {
      id: MAINTENANCE_ROW_ID,
      user_id: input.userId || 'user-demo-1',
      name: 'maintenance.json',
      size_bytes: Buffer.byteLength(payload),
      mime_type: 'application/json',
      url: payload,
      created_at: state.updatedAt
    },
    { onConflict: 'id' }
  );
  if (error) throw new Error(`Gagal menyimpan status maintenance: ${error.message}`);
  invalidateMaintenanceCache();
  return state;
}
