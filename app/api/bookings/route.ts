import { NextResponse } from "next/server";

// Stubbed booking endpoint (v1). Validates input and returns a booking reference.
// TODO before launch:
//   - persist to a `bookings` table (Supabase): id, service_id, barber_id, start_at,
//     customer_name, customer_phone, customer_email, notes, status='pending', created_at
//   - send a Resend confirmation email
// The multi-step booking form (built on /boek) posts here.

type BookingPayload = {
  service?: string;
  barber?: string;
  startAt?: string;
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

export async function POST(request: Request) {
  let body: BookingPayload;
  try {
    body = (await request.json()) as BookingPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const missing = (["service", "startAt", "name", "phone"] as const).filter(
    (k) => !body[k] || String(body[k]).trim() === "",
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: "missing_fields", fields: missing },
      { status: 422 },
    );
  }

  // Client-style reference (e.g. SAM-7Q3KD) until the DB assigns a real id.
  const reference =
    "SAM-" + Math.random().toString(36).slice(2, 7).toUpperCase();

  // TODO: write to DB + send Resend email here.
  return NextResponse.json({ ok: true, reference, status: "pending" }, { status: 201 });
}
