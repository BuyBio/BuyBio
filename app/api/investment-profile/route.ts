"use server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { supabaseAdminClient } from "@/lib/supabase/admin";

const TABLE_NAME = "investment_profiles";
const MIN_SELECTIONS = 2;
const MAX_SELECTIONS = 3;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdminClient;
  const requestHeaders = await headers();
  const _supabaseHeaders = requestHeaders.get("x-supabase-client");

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

  if (
    !Array.isArray(selections) ||
    selections.length < MIN_SELECTIONS ||
    selections.length > MAX_SELECTIONS
  ) {
    return NextResponse.json(
      {
        error: `투자 성향은 최소 ${MIN_SELECTIONS}개, 최대 ${MAX_SELECTIONS}개까지 선택해야 합니다.`,
      },
      { status: 400 },
    );
  }

  const normalizedSelections = Array.from(new Set(selections));

  if (normalizedSelections.length < MIN_SELECTIONS) {
    return NextResponse.json(
      { error: "중복 없이 최소 2개 이상의 성향을 선택해주세요." },
      { status: 400 },
    );
  }

  const payload = {
    user_id: session.user.id,
    selections: normalizedSelections,
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
