import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { createPayment } from '@/lib/supabase/db';
import { MidtransClient } from '@/lib/midtrans/client';

const PACKAGES: Record<string, { name: string; price: number; type: 'basic_110k' | 'pro_210k' | 'pro_upgrade_100k' | 'app_credit_bundle' | 'ai_credit_topup' | 'pro_subscription' }> = {
  basic_110k: {
    name: 'Paket Basic (1 App Siap Publish + 50.000 Kredit AI)',
    price: 110000,
    type: 'basic_110k'
  },
  topup_app_100k: {
    name: 'Paket Basic (1 App Siap Publish + 50.000 Kredit AI)',
    price: 110000,
    type: 'basic_110k'
  },
  bundle_1: {
    name: 'Paket Basic (1 App Siap Publish + 50.000 Kredit AI)',
    price: 110000,
    type: 'basic_110k'
  },
  pro_210k: {
    name: 'Paket Pro (1 App + 100.000 Kredit AI + Seluruh Fitur Pro)',
    price: 210000,
    type: 'pro_210k'
  },
  pro_upgrade_100k: {
    name: 'Upgrade ke Tier Pro (+50.000 Kredit AI + Seluruh Fitur Pro)',
    price: 100000,
    type: 'pro_upgrade_100k'
  },
  pro_monthly: {
    name: 'Upgrade ke Tier Pro (+50.000 Kredit AI + Seluruh Fitur Pro)',
    price: 100000,
    type: 'pro_upgrade_100k'
  },
  ai_topup_100k: {
    name: 'Top-Up 100.000 Kredit AI Token',
    price: 25000,
    type: 'ai_credit_topup'
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
