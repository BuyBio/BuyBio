import axios from "axios";

// KIS API 환경변수
const KIS_APP_KEY = process.env.KIS_APP_KEY;
const KIS_APP_SECRET = process.env.KIS_APP_SECRET;
const KIS_ACCESS_TOKEN = process.env.KIS_ACCESS_TOKEN;

// 토큰 캐싱을 위한 변수
let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

// KIS API 기본 URL (실투자용)
const KIS_BASE_URL = "https://openapi.koreainvestment.com:9443";

interface KISTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface StockPriceData {
  stck_prpr: string; // 현재가
  prdy_vrss: string; // 전일대비
  prdy_vrss_sign: string; // 전일대비부호
  prdy_ctrt: string; // 전일대비율
  acml_vol: string; // 누적거래량
  acml_tr_pbmn: string; // 누적거래대금
  stck_sdpr: string; // 기준가
  stck_oprc: string; // 시가
  stck_hgpr: string; // 고가
  stck_lwpr: string; // 저가
  stck_prdy_clpr: string; // 전일종가
}

interface StockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * KIS API 액세스 토큰 발급
 */
export async function getKISToken(): Promise<string> {
  if (!KIS_APP_KEY || !KIS_APP_SECRET) {
    throw new Error("KIS API 키가 설정되지 않았습니다.");
  }

  // 캐시된 토큰이 있고 아직 유효한지 확인
  const now = Date.now();
  if (cachedToken && now < tokenExpiryTime) {
    console.log("캐시된 토큰 사용");
    return cachedToken;
  }

  try {
    console.log("KIS 토큰 발급 요청:", {
      url: `${KIS_BASE_URL}/oauth2/tokenP`,
      appKey: KIS_APP_KEY?.substring(0, 8) + "...",
      appSecretLength: KIS_APP_SECRET?.length,
    });

    const response = await axios.post<KISTokenResponse>(
      `${KIS_BASE_URL}/oauth2/tokenP`,
      {
        grant_type: "client_credentials",
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // 토큰을 캐시에 저장 (만료 시간을 23시간으로 설정)
    cachedToken = response.data.access_token;
    tokenExpiryTime = now + 23 * 60 * 60 * 1000; // 23시간 후 만료

    console.log("새로운 토큰 발급 및 캐싱 완료");
    return response.data.access_token;
  } catch (error) {
    console.error("KIS 토큰 발급 실패:", error);
    throw new Error("KIS API 토큰 발급에 실패했습니다.");
  }
}

/**
 * 종목 현재가 조회
 */
export async function getStockPrice(
  stockCode: string,
  token?: string,
): Promise<StockPriceData> {
  const accessToken = token || KIS_ACCESS_TOKEN || (await getKISToken());

  try {
    const response = await axios.get(
      `${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`,
      {
        params: {
          FID_COND_MRKT_DIV_CODE: "J", // J: KOSPI, Q: KOSDAQ
          FID_INPUT_ISCD: stockCode,
        },
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
          appkey: KIS_APP_KEY,
          appsecret: KIS_APP_SECRET,
          tr_id: "FHKST01010100",
        },
      },
    );

    return response.data.output;
  } catch (error) {
    console.error(`종목 ${stockCode} 현재가 조회 실패:`, error);
    throw new Error(`종목 ${stockCode}의 현재가 조회에 실패했습니다.`);
  }
}

/**
 * 종목 일봉 데이터 조회 (최근 120일)
 */
export async function getStockDailyData(
  stockCode: string,
  token?: string,
): Promise<StockData[]> {
  console.log(`일봉 데이터 조회 시작: ${stockCode}`);
  const accessToken = token || KIS_ACCESS_TOKEN || (await getKISToken());
  console.log(`토큰 획득 완료: ${accessToken?.substring(0, 20)}...`);

  try {
    const response = await axios.get(
      `${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`,
      {
        params: {
          FID_COND_MRKT_DIV_CODE: "J", // J: KOSPI, Q: KOSDAQ
          FID_INPUT_ISCD: stockCode,
          FID_INPUT_DATE_1: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
            .replace(/-/g, ""),
          FID_INPUT_DATE_2: new Date()
            .toISOString()
            .split("T")[0]
            .replace(/-/g, ""),
          FID_PERIOD_DIV_CODE: "D", // D: 일봉
          FID_ORG_ADJ_PRC: "1", // 1: 수정주가
        },
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
          appkey: KIS_APP_KEY,
          appsecret: KIS_APP_SECRET,
          tr_id: "FHKST03010100",
        },
      },
    );

    const rawData = response.data.output2;

    console.log(`원본 데이터 샘플:`, rawData[0]);

    return rawData.map((item: any) => {
      // 날짜 파싱 (YYYYMMDD 형식)
      let date: Date;
      if (item.stck_bsop_date) {
        const dateStr = item.stck_bsop_date.toString();
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date();
      }

      return {
        date,
        open: parseFloat(item.stck_oprc),
        high: parseFloat(item.stck_hgpr),
        low: parseFloat(item.stck_lwpr),
        close: parseFloat(item.stck_clpr),
        volume: parseInt(item.acml_vol),
      };
    });
  } catch (error) {
    console.error(`종목 ${stockCode} 일봉 조회 실패:`, error);
    throw new Error(`종목 ${stockCode}의 일봉 데이터 조회에 실패했습니다.`);
  }
}

/**
 * 종목 호가 정보 조회
 */
export async function getStockOrderbook(
  stockCode: string,
  token?: string,
): Promise<any> {
  const accessToken = token || KIS_ACCESS_TOKEN || (await getKISToken());

  try {
    const response = await axios.get(
      `${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn`,
      {
        params: {
          FID_COND_MRKT_DIV_CODE: "J", // J: KOSPI, Q: KOSDAQ
          FID_INPUT_ISCD: stockCode,
        },
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
          appkey: KIS_APP_KEY,
          appsecret: KIS_APP_SECRET,
          tr_id: "FHKST01010200",
        },
      },
    );

    return response.data.output1;
  } catch (error) {
    console.error(`종목 ${stockCode} 호가 조회 실패:`, error);
    throw new Error(`종목 ${stockCode}의 호가 정보 조회에 실패했습니다.`);
  }
}

/**
 * 시장 지수 조회 (코스피, 코스닥)
 */
export async function getMarketIndex(token?: string): Promise<any> {
  const accessToken = token || KIS_ACCESS_TOKEN || (await getKISToken());

  try {
    const response = await axios.get(
      `${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-indexchartprice`,
      {
        params: {
          FID_COND_MRKT_DIV_CODE: "U", // U: 업종, J: KOSPI, Q: KOSDAQ
          FID_INPUT_ISCD: "0001", // 코스피 지수
          FID_INPUT_DATE_1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
            .replace(/-/g, ""),
          FID_INPUT_DATE_2: new Date()
            .toISOString()
            .split("T")[0]
            .replace(/-/g, ""),
          FID_PERIOD_DIV_CODE: "D",
        },
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
          appkey: KIS_APP_KEY,
          appsecret: KIS_APP_SECRET,
          tr_id: "FHKUP03500100",
        },
      },
    );

    return response.data.output2;
  } catch (error) {
    console.error("시장 지수 조회 실패:", error);
    throw new Error("시장 지수 조회에 실패했습니다.");
  }
}
