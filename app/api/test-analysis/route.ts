import { NextResponse } from "next/server";

import { getStockDailyData } from "@/lib/kis-api";
import {
  calculateScore,
  performTechnicalAnalysis,
} from "@/lib/technical-indicators";

export async function GET() {
  try {
    console.log("=== 기술적 분석 테스트 시작 ===");

    // 로킷헬스케어 (376900) 테스트
    const stockCode = "376900";
    console.log(`테스트 종목코드: ${stockCode}`);

    const stockData = await getStockDailyData(stockCode);
    console.log(`주식 데이터 개수: ${stockData.length}`);

    if (stockData.length < 50) {
      return NextResponse.json({
        success: false,
        error: `데이터가 부족합니다: ${stockData.length}개`,
      });
    }

    console.log("기술적 분석 시작...");
    const analysis = performTechnicalAnalysis(stockData);
    console.log("기술적 분석 완료");

    if (!analysis) {
      return null;
    }

    console.log("점수 계산 시작...");
    const scoreResult = calculateScore(analysis);
    console.log("점수 계산 완료");

    console.log("=== 기술적 분석 테스트 완료 ===");

    return NextResponse.json({
      success: true,
      data: {
        stockCode,
        dataCount: stockData.length,
        analysis: {
          macdLength: analysis.macd.MACD.length,
          dema5Length: analysis.dema5.length,
          dema20Length: analysis.dema20.length,
          dema120Length: analysis.dema120.length,
          rsiLength: analysis.rsi.length,
        },
        score: scoreResult,
        sampleData: stockData.slice(0, 3),
      },
    });
  } catch (error: any) {
    console.error("=== 기술적 분석 테스트 오류 ===", error);

    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack,
    });
  }
}
