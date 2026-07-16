import { Receiver } from '@upstash/qstash';
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmailReal, sendPasswordResetEmailReal } from '@/lib/mail';

const receiver = process.env.QSTASH_CURRENT_SIGNING_KEY
  ? new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    
    // Validate secure QStash signature in production
    if (receiver) {
      const signature = req.headers.get('upstash-signature') || '';
      const isValid = await receiver.verify({
        body: rawBody,
        signature: signature,
      });
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { type, email, token, name, role } = payload;

    console.log(`✉️ Upstash QStash Worker Executing Job: Type=${type}, To=${email}`);

    if (type === 'VERIFICATION') {
      const success = await sendVerificationEmailReal(email, token, name || 'User', role || 'CUSTOMER');
      return NextResponse.json({ success });
    } else if (type === 'RESET_PASSWORD') {
      const success = await sendPasswordResetEmailReal(email, token);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: "Unknown job type" }, { status: 400 });
  } catch (error) {
    console.error("QStash Webhook Worker Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
