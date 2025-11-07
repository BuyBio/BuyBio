import { type NextRequest, NextResponse } from "next/server";

import { readCompaniesByKeywords } from "@/lib/excel-reader";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "키워드가 필요합니다." },
        { status: 400 },
      );
    }

    // 최대 3개 키워드만 처리
    const selectedKeywords = keywords.slice(0, 3);
    const result = readCompaniesByKeywords(selectedKeywords, 2);

    return NextResponse.json(result);
  } catch (error) {
    console.error("추천 생성 오류:", error);
    return NextResponse.json(
      { error: "추천 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
