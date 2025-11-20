"use server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { supabaseAdminClient } from "@/lib/supabase/admin";

const TABLE_NAME = "investment_profiles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdminClient;
  const requestHeaders = await headers();
  const supabaseHeaders = requestHeaders.get("x-supabase-client");

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, user_id, selections, updated_at, created_at")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load investment profile", error);
    return NextResponse.json(
      {
        error: "Failed to load profile",
        details: error.message,
        hint: (error as { hint?: string }).hint,
      },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({
    profile: {
      id: data.id,
      selections: data.selections,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const selections = body?.selections;

  if (!Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json(
      { error: "선택한 투자 성향이 필요합니다." },
      { status: 400 },
    );
  }

  const payload = {
    user_id: session.user.id,
    selections,
  };

  const supabase = supabaseAdminClient;
  await headers();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: "user_id" })
    .select("id, selections, updated_at")
    .single();

  if (error) {
    console.error("Failed to save investment profile", error);
    return NextResponse.json(
      {
        error: "Failed to save profile",
        details: error.message,
        hint: (error as { hint?: string }).hint,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    profile: {
      id: data.id,
      selections: data.selections,
      updatedAt: data.updated_at,
    },
  });
}
