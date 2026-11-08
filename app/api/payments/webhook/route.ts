import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentByOrderId,
  updatePayment,
  addAppCredits,
  addAiCredits,
  upgradeToPro
} from '@/lib/supabase/db';
import { MidtransClient, MidtransWebhookPayload } from '@/lib/midtrans/client';

export async function POST(req: NextRequest) {
  try {
    const payload: MidtransWebhookPayload = await req.json();
    const midtrans = new MidtransClient();

    // Verify SHA-512 signature
    const isSignatureValid = midtrans.verifySignature(payload);
    if (!isSignatureValid) {
      console.warn('Midtrans Webhook: Invalid SHA-512 signature for order', payload.order_id);
      return NextResponse.json({ error: 'Signature key tidak valid' }, { status: 403 });
    }

    const orderId = payload.order_id;
    const payment = await getPaymentByOrderId(orderId);
    if (!payment) {
      console.warn('Midtrans Webhook: Order not found in database', orderId);
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    const isSuccess = midtrans.isSuccessPayment(payload);
    const newStatus = isSuccess ? 'settlement' : (payload.transaction_status as any);

    // If already settled, do not double-fulfill
    if (payment.status === 'settlement') {
      return NextResponse.json({ success: true, message: 'Sudah diproses sebelumnya' });
    }

    await updatePayment(orderId, {
      status: newStatus,
      raw_payload: payload
    });

    if (isSuccess) {
      // Fulfill based on item_type
      if (payment.item_type === 'basic_110k' || payment.item_type === 'app_credit_bundle') {
        // Basic: 1 App Credit + 50,000 AI Credits
        await addAppCredits(payment.user_id, 1, `midtrans_order_${orderId}`);
        await addAiCredits(payment.user_id, 50000, `midtrans_order_${orderId}`);
      } else if (payment.item_type === 'pro_210k') {
        // Pro New: 1 App Credit + 100,000 AI Credits + Pro Tier
        await addAppCredits(payment.user_id, 1, `midtrans_order_${orderId}`);
        await addAiCredits(payment.user_id, 100000, `midtrans_order_${orderId}`);
        await upgradeToPro(payment.user_id, 365);
      } else if (payment.item_type === 'pro_upgrade_100k' || payment.item_type === 'pro_subscription') {
        // Pro Upgrade: +50,000 AI Credits + Pro Tier
        await addAiCredits(payment.user_id, 50000, `midtrans_pro_upgrade_${orderId}`);
        await upgradeToPro(payment.user_id, 365);
      } else if (payment.item_type === 'ai_credit_topup') {
        // 100,000 AI Credits
        await addAiCredits(payment.user_id, 100000, `midtrans_order_${orderId}`);
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: any) {
    console.error('Midtrans Webhook exception:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
