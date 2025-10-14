import { NextResponse } from "next/server";

import { getKISToken } from "@/lib/kis-api";

export async function GET() {
  try {
    console.log("=== 토큰 캐시 테스트 시작 ===");

    // 첫 번째 토큰 요청
    console.log("첫 번째 토큰 요청...");
    const token1 = await getKISToken();
    console.log(`첫 번째 토큰: ${token1.substring(0, 20)}...`);

    // 두 번째 토큰 요청 (캐시에서 가져와야 함)
    console.log("두 번째 토큰 요청...");
    const token2 = await getKISToken();
    console.log(`두 번째 토큰: ${token2.substring(0, 20)}...`);

    console.log("=== 토큰 캐시 테스트 완료 ===");

    return NextResponse.json({
      success: true,
      data: {
        token1: token1.substring(0, 20) + "...",
        token2: token2.substring(0, 20) + "...",
        isCached: token1 === token2,
      },
    });
  } catch (error: any) {
    console.error("=== 토큰 캐시 테스트 오류 ===", error);

    return NextResponse.json({
      success: false,
      error: error.message,
      details: error,
    });
  }
}
