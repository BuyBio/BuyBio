import { EMA, MACD, RSI, SMA, VolumeProfile } from "technicalindicators";

export interface StockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MACDResult {
  MACD: number[];
  Signal: number[];
  Histogram: number[];
}

export interface TechnicalAnalysis {
  sma5: number[];
  sma20: number[];
  sma120: number[];
  dema5: number[];
  dema20: number[];
  dema120: number[];
  macd: MACDResult;
  rsi: number[];
  volumeProfile?: number[];
}

/**
 * DEMA (Double Exponential Moving Average) 계산
 */
export function calculateDEMA(data: number[], period: number): number[] {
  const ema1 = EMA.calculate({ values: data, period });
  const ema2 = EMA.calculate({ values: ema1, period });

  const dema: number[] = [];
  for (let i = 0; i < ema1.length; i++) {
    dema.push(2 * ema1[i] - ema2[i]);
  }

  return dema;
}

/**
 * MACD 계산
 */
export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): MACDResult {
  const macdInput = {
    values: data,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  };

  const macd = MACD.calculate(macdInput);

  return {
    MACD: macd.map((item) => item.MACD || 0),
    Signal: macd.map((item) => item.signal || 0),
    Histogram: macd.map((item) => item.histogram || 0),
  };
}

/**
 * 거래량 오실레이터 계산
 */
export function calculateVolumeOscillator(
  high: number[],
  low: number[],
  volume: number[],
): {
  vo: number[];
  crossUp: boolean;
  crossDown: boolean;
} {
  if (!volume || volume.length === 0) {
    return { vo: [], crossUp: false, crossDown: false };
  }

  // 간단한 거래량 오실레이터 (5일 vs 20일 거래량 이동평균)
  const volumeSma5 = SMA.calculate({ values: volume, period: 5 });
  const volumeSma20 = SMA.calculate({ values: volume, period: 20 });

  const vo: number[] = [];
  for (let i = 0; i < Math.min(volumeSma5.length, volumeSma20.length); i++) {
    const voValue = ((volumeSma5[i] - volumeSma20[i]) / volumeSma20[i]) * 100;
    vo.push(voValue);
  }

  // 교차 신호 확인 (최근 2일)
  let crossUp = false;
  let crossDown = false;

  if (vo.length >= 2) {
    const current = vo[vo.length - 1];
    const previous = vo[vo.length - 2];

    crossUp = previous <= 0 && current > 0;
    crossDown = previous >= 0 && current < 0;
  }

  return { vo, crossUp, crossDown };
}

/**
 * 종합 기술적 분석 수행
 */
export function performTechnicalAnalysis(
  stockData: StockData[],
): TechnicalAnalysis | null {
  if (stockData.length < 50) {
    console.warn(`데이터가 부족합니다: ${stockData.length}개 (최소 50개 필요)`);
    return null; // 최소 50일 데이터 필요
  }

  const closes = stockData.map((d) => d.close);
  const highs = stockData.map((d) => d.high);
  const lows = stockData.map((d) => d.low);
  const volumes = stockData.map((d) => d.volume || 0);

  // 이동평균 계산
  const sma5 = SMA.calculate({ values: closes, period: 5 });
  const sma20 = SMA.calculate({ values: closes, period: 20 });
  const sma120 =
    stockData.length >= 120
      ? SMA.calculate({ values: closes, period: 120 })
      : sma20;

  // DEMA 계산
  const dema5 = calculateDEMA(closes, 5);
  const dema20 = calculateDEMA(closes, 20);
  const dema120 = stockData.length >= 120 ? calculateDEMA(closes, 120) : dema20;

  // MACD 계산
  const macd = calculateMACD(closes);

  // RSI 계산
  const rsi = RSI.calculate({ values: closes, period: 14 });

  // 거래량 오실레이터 계산
  const volumeOscillator = calculateVolumeOscillator(highs, lows, volumes);

  return {
    sma5,
    sma20,
    sma120,
    dema5,
    dema20,
    dema120,
    macd,
    rsi,
    volumeProfile: volumeOscillator.vo,
  };
}

/**
 * 점수 산정 (파이썬 로직과 동일)
 */
export function calculateScore(analysis: TechnicalAnalysis): {
  shortScore: number;
  midLongScore: number;
  totalScore: number;
  recommendation: string;
} {
  const weights = {
    MA: 1.0, // 가격이동평균/DEMA
    MACD: 1.5, // MACD
    VO: 1.0, // 거래량 오실레이터
    RSI: 0.8, // RSI
  };

  let shortScore = 0;
  let midLongScore = 0;

  // 기본 점수 계산 함수 (더 세밀한 점수)
  const getBasicPoints = (signal: number, weight: number): number => {
    return (signal > 0 ? 2.0 : signal < 0 ? -2.0 : 0.0) * weight;
  };

  // 단기: 5/20 교차 (DEMA 우선, 없으면 SMA)
  const dema5 = analysis.dema5;
  const dema20 = analysis.dema20;
  const sma5 = analysis.sma5;
  const sma20 = analysis.sma20;

  if (dema5.length >= 2 && dema20.length >= 2) {
    const shortBuy =
      dema5[dema5.length - 2] <= dema20[dema20.length - 2] &&
      dema5[dema5.length - 1] > dema20[dema20.length - 1];
    const shortSell =
      dema5[dema5.length - 2] >= dema20[dema20.length - 2] &&
      dema5[dema5.length - 1] < dema20[dema20.length - 1];

    const shortSignal = shortBuy ? 1 : shortSell ? -1 : 0;
    shortScore += getBasicPoints(shortSignal, weights.MA);
  } else if (sma5.length >= 2 && sma20.length >= 2) {
    const shortBuy =
      sma5[sma5.length - 2] <= sma20[sma20.length - 2] &&
      sma5[sma5.length - 1] > sma20[sma20.length - 1];
    const shortSell =
      sma5[sma5.length - 2] >= sma20[sma20.length - 2] &&
      sma5[sma5.length - 1] < sma20[sma20.length - 1];

    const shortSignal = shortBuy ? 1 : shortSell ? -1 : 0;
    shortScore += getBasicPoints(shortSignal, weights.MA);
  }

  // 중장기: 20/120 교차 (DEMA 우선)
  const dema120 = analysis.dema120;
  const sma120 = analysis.sma120;

  if (dema20.length >= 2 && dema120.length >= 2) {
    const midBuy =
      dema20[dema20.length - 2] <= dema120[dema120.length - 2] &&
      dema20[dema20.length - 1] > dema120[dema120.length - 1];
    const midSell =
      dema20[dema20.length - 2] >= dema120[dema120.length - 2] &&
      dema20[dema20.length - 1] < dema120[dema120.length - 1];

    const midSignal = midBuy ? 1 : midSell ? -1 : 0;
    midLongScore += getBasicPoints(midSignal, weights.MA);
  } else if (sma20.length >= 2 && sma120.length >= 2) {
    const midBuy =
      sma20[sma20.length - 2] <= sma120[sma120.length - 2] &&
      sma20[sma20.length - 1] > sma120[sma120.length - 1];
    const midSell =
      sma20[sma20.length - 2] >= sma120[sma120.length - 2] &&
      sma20[sma20.length - 1] < sma120[sma120.length - 1];

    const midSignal = midBuy ? 1 : midSell ? -1 : 0;
    midLongScore += getBasicPoints(midSignal, weights.MA);
  }

  // MACD 교차 (공통 지표로 양쪽에 반영)
  const macdValues = analysis.macd.MACD;
  const signalValues = analysis.macd.Signal;

  if (macdValues.length >= 1 && signalValues.length >= 1) {
    const macdBuy =
      macdValues[macdValues.length - 1] > signalValues[signalValues.length - 1];
    const macdSell =
      macdValues[macdValues.length - 1] < signalValues[signalValues.length - 1];

    const macdSignal = macdBuy ? 1 : macdSell ? -1 : 0;
    shortScore += getBasicPoints(macdSignal, weights.MACD);
    midLongScore += getBasicPoints(macdSignal, weights.MACD);
  }

  // RSI 지표 (30-70 범위 기준)
  const rsiValues = analysis.rsi;
  if (rsiValues.length >= 1) {
    const rsi = rsiValues[rsiValues.length - 1];
    let rsiSignal = 0;

    if (rsi < 30) {
      rsiSignal = 1; // 과매도 -> 매수 신호
    } else if (rsi > 70) {
      rsiSignal = -1; // 과매수 -> 매도 신호
    } else if (rsi > 50) {
      rsiSignal = 0.5; // 중립에서 약간 강세
    } else if (rsi < 50) {
      rsiSignal = -0.5; // 중립에서 약간 약세
    }

    shortScore += getBasicPoints(rsiSignal, weights.RSI);
    midLongScore += getBasicPoints(rsiSignal, weights.RSI);
  }

  const totalScore = shortScore + midLongScore;
  const recommendation = totalScore > 0 ? "매수 추천" : "매도 추천";

  return {
    shortScore: Math.round(shortScore * 100) / 100,
    midLongScore: Math.round(midLongScore * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
    recommendation,
  };
}
