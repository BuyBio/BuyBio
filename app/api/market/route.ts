import { NextResponse } from "next/server";

import { getMarketIndex } from "@/lib/kis-api";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    // 1. 유저 인증 확인
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 },
      );
    }

    // 2. 시장 지수 데이터 조회
    const marketData = await getMarketIndex();

    // 3. 최신 데이터 추출
    const latestData = marketData[marketData.length - 1];
    const previousData = marketData[marketData.length - 2];

    if (!latestData || !previousData) {
      return NextResponse.json(
        { error: "시장 지수 데이터를 가져올 수 없습니다." },
        { status: 500 },
      );
    }

    // 4. 계산
    const currentValue = parseFloat(latestData.bstp_nmix_prpr);
    const previousValue = parseFloat(previousData.bstp_nmix_prpr);
    const change = currentValue - previousValue;
    const changeRate = (change / previousValue) * 100;

    return NextResponse.json({
      success: true,
      data: {
        index: {
          name: "코스피",
          code: "KOSPI",
          current: currentValue,
          change: change,
          changeRate: changeRate,
          changeSign: change >= 0 ? "1" : "2",
          date: latestData.bstp_nmix_hms,
        },
        recentData: marketData.slice(-30).map((item) => ({
          date: item.bstp_nmix_hms,
          value: parseFloat(item.bstp_nmix_prpr),
          volume: parseInt(item.acml_vol),
        })),
      },
    });
  } catch (error) {
    console.error("Market API 오류:", error);
    return NextResponse.json(
      { success: false, error: "시장 지수 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
