import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { createPayment } from '@/lib/supabase/db';
import { MidtransClient } from '@/lib/midtrans/client';

const PACKAGES: Record<string, { name: string; price: number; type: 'app_credit_bundle' | 'ai_credit_topup' | 'pro_subscription' }> = {
  bundle_1: {
    name: '1 Slot App + 50.000 Kredit AI',
    price: 49000,
    type: 'app_credit_bundle'
  },
  ai_topup_100k: {
    name: '100.000 Kredit AI Top-Up',
    price: 25000,
    type: 'ai_credit_topup'
  },
  pro_monthly: {
    name: 'Langganan Forge Pro (30 Hari + 5 App + 250k AI)',
    price: 149000,
    type: 'pro_subscription'
  }
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { packageId } = await req.json();
  const pkg = PACKAGES[packageId];
  if (!pkg) {
    return NextResponse.json({ error: 'Paket pembayaran tidak valid' }, { status: 400 });
  }

  const orderId = `VC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const midtrans = new MidtransClient();

  const snapResult = await midtrans.createTransaction({
    orderId,
    grossAmount: pkg.price,
    customerDetails: {
      first_name: user.username,
      email: user.email
    },
    itemDetails: [
      {
        id: packageId,
        price: pkg.price,
        quantity: 1,
        name: pkg.name
      }
    ]
  });

  // Record payment in database
  const paymentRecord = await createPayment({
    order_id: orderId,
    user_id: user.userId,
    amount: pkg.price,
    item_type: pkg.type,
    status: 'pending',
    snap_token: snapResult.token,
    snap_redirect_url: snapResult.redirect_url,
    raw_payload: { packageId, packageName: pkg.name }
  });

  return NextResponse.json({
    success: true,
    orderId,
    token: snapResult.token,
    redirectUrl: snapResult.redirect_url,
    payment: paymentRecord
  });
}
