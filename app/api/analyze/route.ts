import { NextResponse } from "next/server";

import {
  getCompaniesBySurveyType,
  loadCompanyCodes,
  loadCompanyData,
} from "@/lib/company-data";
import { getStockDailyData, getStockPrice } from "@/lib/kis-api";
import { createClient } from "@/lib/supabase/server";
import {
  calculateScore,
  performTechnicalAnalysis,
  StockData,
} from "@/lib/technical-indicators";

export async function GET(request: Request) {
  try {
    // 1. 유저 인증 확인 (임시로 비활성화)
    // const authHeader = request.headers.get("authorization");
    // const token = authHeader?.split(" ")[1];

    // if (!token) {
    //   return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 });
    // }

    // const supabase = await createClient();
    // const { data: { user }, error } = await supabase.auth.getUser(token);

    // if (error || !user) {
    //   return NextResponse.json({ error: "유효하지 않은 토큰입니다." }, { status: 401 });
    // }

    // 2. 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const action = searchParams.get("action");

    // 3. 기업 데이터 로드
    const companyData = loadCompanyData();
    const companyCodes = loadCompanyCodes();

    let targetCompanies: string[] = [];

    if (action === "by-type" && type) {
      // 특정 설문 유형에 해당하는 기업들
      const surveyType = parseInt(type);
      if (isNaN(surveyType) || surveyType < 1 || surveyType > 11) {
        return NextResponse.json(
          { error: "설문 유형은 1~11 사이의 숫자여야 합니다." },
          { status: 400 },
        );
      }
      targetCompanies = getCompaniesBySurveyType(surveyType);
    } else {
      // 모든 기업
      targetCompanies = Object.keys(companyData);
    }

    // 4. 종목 분석 수행
    const results: any[] = [];
    console.log(`분석 대상 기업 수: ${targetCompanies.length}, 제한: ${limit}`);

    for (const companyName of targetCompanies.slice(0, limit)) {
      console.log(`분석 시작: ${companyName}`);
      try {
        const stockCode = companyCodes[companyName];
        if (!stockCode) {
          console.warn(`종목코드를 찾을 수 없습니다: ${companyName}`);
          continue;
        }
        console.log(`${companyName} 종목코드: ${stockCode}`);

        // 주식 데이터 조회
        const stockData = await getStockDailyData(stockCode);
        if (!stockData || stockData.length < 50) {
          console.warn(
            `충분한 데이터가 없습니다: ${companyName} (${stockCode}) - 데이터 개수: ${stockData?.length || 0}`,
          );
          continue;
        }
        console.log(`${companyName} 데이터 개수: ${stockData.length}`);

        // 기술적 분석 수행
        const analysis = performTechnicalAnalysis(stockData);
        if (!analysis) {
          console.warn(`기술적 분석 실패: ${companyName} (${stockCode})`);
          continue;
        }

        // 점수 계산
        const scoreResult = calculateScore(analysis);

        // 현재가 조회
        const currentPrice = await getStockPrice(stockCode);

        results.push({
          code: stockCode,
          name: companyName,
          currentPrice: parseFloat(currentPrice.stck_prpr),
          priceChange: parseFloat(currentPrice.prdy_vrss),
          priceChangeRate: parseFloat(currentPrice.prdy_ctrt),
          recommendation: scoreResult.recommendation,
          scores: {
            short_term: scoreResult.shortScore,
            mid_long_term: scoreResult.midLongScore,
            total: scoreResult.totalScore,
          },
          indicators: {
            macd: analysis.macd.MACD[analysis.macd.MACD.length - 1] || null,
            signal:
              analysis.macd.Signal[analysis.macd.Signal.length - 1] || null,
            dema5: analysis.dema5[analysis.dema5.length - 1] || null,
            dema20: analysis.dema20[analysis.dema20.length - 1] || null,
            dema120: analysis.dema120[analysis.dema120.length - 1] || null,
            rsi: analysis.rsi[analysis.rsi.length - 1] || null,
          },
          companyInfo: companyData[companyName],
        });
      } catch (error) {
        console.error(`${companyName} 분석 중 오류:`, error);
      }
    }

    // 5. 점수 순으로 정렬 (높은 점수부터)
    results.sort((a, b) => b.scores.total - a.scores.total);

    return NextResponse.json({
      success: true,
      data: {
        results,
        totalAnalyzed: results.length,
        requestedType: type ? parseInt(type) : null,
        limit,
      },
    });
  } catch (error) {
    console.error("분석 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "분석 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
