import { NextResponse } from "next/server";

import { getStockDailyData } from "@/lib/kis-api";

export async function GET() {
  try {
    console.log("=== 주식 데이터 테스트 시작 ===");

    // 로킷헬스케어 (376900) 테스트
    const stockCode = "376900";
    console.log(`테스트 종목코드: ${stockCode}`);

    const stockData = await getStockDailyData(stockCode);

    console.log("=== 주식 데이터 테스트 완료 ===");
    console.log(`데이터 개수: ${stockData.length}`);

    return NextResponse.json({
      success: true,
      data: {
        stockCode,
        dataCount: stockData.length,
        sampleData: stockData.slice(0, 3), // 처음 3개만 샘플로
        lastData: stockData[stockData.length - 1], // 마지막 데이터
      },
    });
  } catch (error: any) {
    console.error("=== 주식 데이터 테스트 오류 ===", error);

    return NextResponse.json({
      success: false,
      error: error.message,
      details: error,
    });
  }
}
