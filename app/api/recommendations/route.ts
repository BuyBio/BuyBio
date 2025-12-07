import { type NextRequest, NextResponse } from "next/server";

import { loadCompanyCodes } from "@/lib/company-data";
import { readCompaniesByKeywords } from "@/lib/excel-reader";
import {
  calculateScore,
  performTechnicalAnalysis,
  type StockData,
} from "@/lib/technical-indicators";

import axios from "axios";

// 웹소켓 서버 설정
const WS_BASE_URL = "https://ws-stock.froggy1014.dev";
const WS_URL = "wss://ws-stock.froggy1014.dev/ws-stock";

// 일봉 데이터 응답 타입
interface ChartDataItem {
  stck_bsop_date: string; // YYYYMMDD
  stck_clpr: string; // 종가
  stck_oprc?: string; // 시가
  stck_hgpr?: string; // 고가
  stck_lwpr?: string; // 저가
  acml_vol: string; // 거래량
}

// 실시간 주가 데이터 타입
interface RealtimeStockData {
  price: number;
  change: number;
  changeRate: number;
}

// 최종 주가 데이터 타입
interface StockDataResult {
  [stockCode: string]: {
    dailyData: StockData[]; // 일봉 데이터 (최소 50일 필요)
    currentPrice: {
      price: number;
      change: number;
      changeRate: number;
    };
  };
}

/**
 * REST API로 일봉 데이터 조회
 */
async function fetchDailyChartData(
  stockCode: string,
): Promise<StockData[] | null> {
  try {
    const response = await axios.get<ChartDataItem[]>(
      `${WS_BASE_URL}/api/v1/chart/${stockCode}`,
    );

    if (!response.data || response.data.length === 0) {
      return null;
    }

    // 최신 데이터부터 정렬 (내림차순) - 날짜 문자열 비교
    const sortedData = [...response.data].sort((a, b) =>
      b.stck_bsop_date.localeCompare(a.stck_bsop_date),
    );

    // StockData 형식으로 변환
    const stockDataList = sortedData.map((item) => {
      const dateStr = item.stck_bsop_date;
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const date = new Date(`${year}-${month}-${day}`);

      return {
        date,
        open: parseFloat(item.stck_oprc || item.stck_clpr),
        high: parseFloat(item.stck_hgpr || item.stck_clpr),
        low: parseFloat(item.stck_lwpr || item.stck_clpr),
        close: parseFloat(item.stck_clpr),
        volume: parseInt(item.acml_vol) || 0,
      };
    });

    // 날짜 기준으로 한 번 더 정렬 (확실하게 최신이 첫 번째)
    stockDataList.sort((a, b) => b.date.getTime() - a.date.getTime());

    // 디버깅: 최신 3개 데이터 확인
    if (stockDataList.length > 0) {
      console.log(
        `[일봉 데이터] 종목코드 ${stockCode}: 총 ${stockDataList.length}일, 최신 3일 데이터:`,
      );
      stockDataList.slice(0, 3).forEach((data, idx) => {
        console.log(
          `  ${idx + 1}. 날짜: ${data.date.toISOString().split("T")[0]}, 종가: ${data.close}원`,
        );
      });
    }

    return stockDataList;
  } catch (error) {
    console.warn(`종목 ${stockCode} 일봉 데이터 조회 실패:`, error);
    return null;
  }
}

/**
 * 웹소켓으로 실시간 현재가 조회
 * STOMP 프로토콜 사용
 */
async function fetchRealtimePrices(
  stockCodes: string[],
  timeout: number = 5000,
): Promise<Record<string, RealtimeStockData>> {
  return new Promise((resolve) => {
    const results: Record<string, RealtimeStockData> = {};
    const receivedCount = 0;
    const targetCount = stockCodes.length;

    // STOMP 클라이언트는 Node.js 환경에서 직접 구현이 복잡하므로
    // 일단 일봉 데이터의 최신 종가를 사용하고, 웹소켓은 선택적으로 구현
    // TODO: @stomp/stompjs 또는 sockjs-client + stompjs 패키지 설치 필요
    // 현재는 일봉 데이터의 최신 종가를 현재가로 사용

    // 타임아웃 후 결과 반환
    setTimeout(() => {
      resolve(results);
    }, timeout);

    // 웹소켓 연결 로직 (추후 구현)
    // const Stomp = require('@stomp/stompjs');
    // const client = new Stomp.Client({
    //   brokerURL: WS_URL,
    //   reconnectDelay: 5000,
    // });
    //
    // client.onConnect = () => {
    //   stockCodes.forEach((code) => {
    //     client.subscribe(`/topic/stock/${code}`, (message) => {
    //       const data = JSON.parse(message.body);
    //       results[code] = {
    //         price: parseFloat(data.stck_prpr),
    //         change: parseFloat(data.prdy_vrss),
    //         changeRate: parseFloat(data.prdy_ctrt),
    //       };
    //       receivedCount++;
    //       if (receivedCount === targetCount) {
    //         client.deactivate();
    //         resolve(results);
    //       }
    //     });
    //
    //     client.publish({
    //       destination: '/app/subscribe',
    //       body: JSON.stringify({ symbol: code, action: 'ADD' }),
    //     });
    //   });
    // };
    //
    // client.activate();
  });
}

/**
 * 종목코드 리스트로 주가 데이터 조회 (일봉 + 실시간)
 */
async function fetchStockDataFromWebSocket(
  stockCodes: string[],
): Promise<StockDataResult> {
  const result: StockDataResult = {};

  // 1. 일봉 데이터 병렬 조회
  const dailyDataPromises = stockCodes.map(async (code) => {
    const dailyData = await fetchDailyChartData(code);
    return { code, dailyData };
  });

  const dailyDataResults = await Promise.all(dailyDataPromises);

  // 2. 실시간 현재가 조회 (선택적, 실패해도 일봉 데이터로 대체)
  const realtimePrices = await fetchRealtimePrices(stockCodes);

  // 3. 데이터 결합
  dailyDataResults.forEach(({ code, dailyData }) => {
    if (!dailyData || dailyData.length < 50) {
      return; // 최소 50일 데이터 필요
    }

    // 최신 데이터 (가장 최근 날짜) - 날짜 기준으로 확실하게 선택
    const sortedByDate = [...dailyData].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
    const latestData = sortedByDate[0]; // 가장 최근 날짜의 데이터
    const previousData = sortedByDate[1] || latestData; // 전일 데이터

    // 디버깅: 최신 데이터 확인
    console.log(
      `[가격 계산] 종목코드 ${code}: 최신날짜=${latestData.date.toISOString().split("T")[0]}, 최신종가=${latestData.close}, 전일종가=${previousData.close}`,
    );

    // 실시간 가격이 있으면 사용, 없으면 일봉 데이터의 최신 종가 사용
    const realtimePrice = realtimePrices[code];
    const currentPrice = realtimePrice
      ? {
          price: realtimePrice.price,
          change: realtimePrice.change,
          changeRate: realtimePrice.changeRate,
        }
      : {
          price: latestData.close, // 가장 최근 날짜의 종가
          change: latestData.close - previousData.close,
          changeRate:
            ((latestData.close - previousData.close) / previousData.close) *
            100,
        };

    console.log(
      `[최종 가격] 종목코드 ${code}: ${currentPrice.price}원 (변동률: ${currentPrice.changeRate.toFixed(2)}%)`,
    );

    result[code] = {
      dailyData,
      currentPrice,
    };
  });

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body as {
      keywords: string[];
    };

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "키워드가 필요합니다." },
        { status: 400 },
      );
    }

    // 1. 최대 3개 키워드만 처리
    const selectedKeywords = keywords.slice(0, 3);

    // 2. 각 키워드별로 기업 목록 추출 (키워드당 10개씩 가져와서 기술 지표로 필터링)
    const keywordSections = readCompaniesByKeywords(selectedKeywords, 10);

    // 3. 종목코드 로드
    const companyCodes = loadCompanyCodes();

    // 4. 모든 기업의 종목코드 수집
    const allStockCodes: string[] = [];
    const companyToCodeMap: Record<string, string> = {};

    keywordSections.forEach((section) => {
      section.companies.forEach((company) => {
        const stockCode = companyCodes[company.name];
        if (stockCode) {
          allStockCodes.push(stockCode);
          companyToCodeMap[company.name] = stockCode;
          console.log(`[매핑] ${company.name} → 종목코드: ${stockCode}`);
        } else {
          console.warn(
            `[매핑 실패] ${company.name}의 종목코드를 찾을 수 없습니다.`,
          );
        }
      });
    });

    // 5. 웹소켓으로 주가 데이터 조회
    const webSocketStockData = await fetchStockDataFromWebSocket(allStockCodes);

    // 6. 각 키워드 섹션별로 기술 지표 분석 수행
    const result = await Promise.all(
      keywordSections.map((section) => {
        const companiesWithScores = section.companies
          .map((company) => {
            try {
              const stockCode = companyToCodeMap[company.name];
              if (!stockCode) {
                return {
                  ...company,
                  scores: null,
                  recommendation: null,
                };
              }

              // 웹소켓으로 받은 데이터 확인
              const wsData = webSocketStockData[stockCode];

              if (!wsData?.dailyData || wsData.dailyData.length < 50) {
                // 웹소켓 데이터가 없거나 부족한 경우 스킵
                return {
                  ...company,
                  scores: null,
                  recommendation: null,
                };
              }

              // 기술적 분석 수행
              const analysis = performTechnicalAnalysis(wsData.dailyData);
              if (!analysis) {
                return {
                  ...company,
                  scores: null,
                  recommendation: null,
                };
              }

              // 점수 계산
              const scoreResult = calculateScore(analysis);

              // 현재가 정보 처리
              const currentPriceData = wsData.currentPrice;

              // dailyData 배열의 첫 번째 요소가 정말 최신인지 확인
              const firstData = wsData.dailyData[0];
              const lastData = wsData.dailyData[wsData.dailyData.length - 1];
              console.log(
                `[가격 확인] ${company.name} (${stockCode}):`,
                `첫번째데이터=${firstData?.date.toISOString().split("T")[0]} 종가=${firstData?.close}`,
                `마지막데이터=${lastData?.date.toISOString().split("T")[0]} 종가=${lastData?.close}`,
                `반환가격=${currentPriceData.price}`,
              );

              return {
                ...company,
                price: `${currentPriceData.price.toLocaleString()}원`,
                change: `${currentPriceData.changeRate > 0 ? "+" : ""}${currentPriceData.changeRate.toFixed(2)}%`,
                scores: {
                  short_term: scoreResult.shortScore,
                  mid_long_term: scoreResult.midLongScore,
                  total: scoreResult.totalScore,
                },
                recommendation: scoreResult.recommendation,
              };
            } catch (error) {
              // 예상치 못한 에러는 조용히 처리
              return {
                ...company,
                scores: null,
                recommendation: null,
              };
            }
          })
          .filter((c) => c.scores !== null) // 기술 지표 분석이 성공한 것만
          .sort((a, b) => {
            if (!a.scores || !b.scores) return 0;
            return b.scores.total - a.scores.total;
          })
          .slice(0, 3); // 각 키워드별 상위 3개만 선택

        // 기술 지표 분석이 실패한 경우 원본 데이터 사용 (최대 3개)
        if (companiesWithScores.length === 0) {
          return {
            ...section,
            companies: section.companies.slice(0, 3),
          };
        }

        return {
          ...section,
          companies: companiesWithScores,
        };
      }),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("추천 생성 오류:", error);
    return NextResponse.json(
      { error: "추천 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
