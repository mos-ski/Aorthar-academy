// Requires: partnership_inquiries table in Supabase
// CREATE TABLE partnership_inquiries (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   name text NOT NULL,
//   company text NOT NULL,
//   email text NOT NULL,
//   type text NOT NULL,
//   message text,
//   created_at timestamptz DEFAULT now()
// );

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { name, company, email, type, message } = await req.json();

    if (!name || !company || !email || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("partnership_inquiries").insert({
      name,
      company,
      email,
      type,
      message: message ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Partnership insert error:", error);
      return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Partnership route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
