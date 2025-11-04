import { EMA, MACD, RSI, SMA, VolumeProfile } from "technicalindicators";

export interface StockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TechnicalAnalysis {
  sma5: number[];
  sma20: number[];
  sma120: number[];
  dema5: number[];
  dema20: number[];
  dema120: number[];
  macd: {
    MACD: number[];
    Signal: number[];
    Histogram: number[];
  };
  rsi: number[];
  aroon: {
    aroonUp: number[];
    aroonDown: number[];
  };
  elderRay: {
    bull: number[];
    bear: number[];
  };
  forceIndex: number[];
  stochRsi: number[];
  rvi: number[];
  chaikin: number[];
  smi: number[];
  volumeOscillator: number[];
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
export function calculateMACD(data: number[]): {
  MACD: number[];
  Signal: number[];
  Histogram: number[];
} {
  const macdResult = MACD.calculate({
    values: data,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  return {
    MACD: macdResult.map((r) => r.MACD || 0),
    Signal: macdResult.map((r) => r.signal || 0),
    Histogram: macdResult.map((r) => r.histogram || 0),
  };
}

/**
 * 아룬 지표 계산
 */
export function calculateAroon(
  data: { high: number[]; low: number[] },
  period: number = 14,
): {
  aroonUp: number[];
  aroonDown: number[];
} {
  const { high, low } = data;
  const aroonUp: number[] = [];
  const aroonDown: number[] = [];

  for (let i = period - 1; i < high.length; i++) {
    let highestPeriod = 0;
    let lowestPeriod = 0;
    let highestPrice = high[i];
    let lowestPrice = low[i];

    for (let j = i - period + 1; j <= i; j++) {
      if (high[j] >= highestPrice) {
        highestPrice = high[j];
        highestPeriod = i - j;
      }
      if (low[j] <= lowestPrice) {
        lowestPrice = low[j];
        lowestPeriod = i - j;
      }
    }

    aroonUp.push(((period - highestPeriod) / period) * 100);
    aroonDown.push(((period - lowestPeriod) / period) * 100);
  }

  return { aroonUp, aroonDown };
}

/**
 * 엘더레이 강세/약세 지수 계산
 */
export function calculateElderRay(data: {
  high: number[];
  low: number[];
  close: number[];
}): {
  bull: number[];
  bear: number[];
} {
  const { high, low, close } = data;
  const ema13 = EMA.calculate({ values: close, period: 13 });

  const bull: number[] = [];
  const bear: number[] = [];

  for (let i = 0; i < high.length; i++) {
    if (ema13[i]) {
      bull.push(high[i] - ema13[i]);
      bear.push(low[i] - ema13[i]);
    } else {
      bull.push(0);
      bear.push(0);
    }
  }

  return { bull, bear };
}

/**
 * 포스 인덱스 계산
 */
export function calculateForceIndex(data: {
  close: number[];
  volume: number[];
}): number[] {
  const { close, volume } = data;
  const forceIndex: number[] = [0]; // 첫 번째 값은 0

  for (let i = 1; i < close.length; i++) {
    const priceChange = close[i] - close[i - 1];
    forceIndex.push(priceChange * volume[i]);
  }

  return forceIndex;
}

/**
 * 스토캐스틱 RSI 계산
 */
export function calculateStochRSI(
  data: number[],
  period: number = 9,
): number[] {
  const rsi = RSI.calculate({ values: data, period });
  const stochRsi: number[] = [];

  for (let i = 4; i < rsi.length; i++) {
    const rsiSlice = rsi.slice(i - 4, i + 1);
    const rsiHigh = Math.max(...rsiSlice);
    const rsiLow = Math.min(...rsiSlice);

    if (rsiHigh !== rsiLow) {
      stochRsi.push(((rsi[i] - rsiLow) / (rsiHigh - rsiLow)) * 100);
    } else {
      stochRsi.push(50);
    }
  }

  return stochRsi;
}

/**
 * 상대변동성지수 (RVI) 계산
 */
export function calculateRVI(
  data: { close: number[] },
  period: number = 10,
): number[] {
  const { close } = data;
  const rvi: number[] = [];

  for (let i = period - 1; i < close.length; i++) {
    let upSum = 0;
    let downSum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      if (close[j] >= close[j - 1]) {
        // 상승한 날의 표준편차 계산
        const slice = close.slice(Math.max(0, j - 9), j + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
        const variance =
          slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / slice.length;
        upSum += Math.sqrt(variance);
      } else {
        // 하락한 날의 표준편차 계산
        const slice = close.slice(Math.max(0, j - 9), j + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
        const variance =
          slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / slice.length;
        downSum += Math.sqrt(variance);
      }
    }

    const totalSum = upSum + downSum;
    rvi.push(totalSum > 0 ? (upSum / totalSum) * 100 : 50);
  }

  return rvi;
}

/**
 * 스토캐스틱 모멘텀지수 (SMI) 계산
 */
export function calculateSMI(data: {
  close: number[];
  high: number[];
  low: number[];
}): number[] {
  const { close, high, low } = data;
  const smi: number[] = [];

  for (let i = 4; i < close.length; i++) {
    const highSlice = high.slice(i - 4, i + 1);
    const lowSlice = low.slice(i - 4, i + 1);
    const closeSlice = close.slice(i - 4, i + 1);

    const highest = Math.max(...highSlice);
    const lowest = Math.min(...lowSlice);
    const middle = (highest + lowest) / 2;

    let cm = 0;
    let hl = 0;

    for (let j = 0; j < 5; j++) {
      cm += closeSlice[j] - middle;
      hl += highest - lowest;
    }

    if (hl !== 0) {
      smi.push((cm / hl) * 100);
    } else {
      smi.push(0);
    }
  }

  return smi;
}

/**
 * 거래량 오실레이터 계산
 */
export function calculateVolumeOscillator(data: {
  volume: number[];
}): number[] {
  const { volume } = data;
  const sma5 = SMA.calculate({ values: volume, period: 5 });
  const sma20 = SMA.calculate({ values: volume, period: 20 });

  const volumeOscillator: number[] = [];

  for (let i = 0; i < sma5.length && i < sma20.length; i++) {
    volumeOscillator.push(sma5[i] - sma20[i]);
  }

  return volumeOscillator;
}

/**
 * 종합 기술적 분석 수행 (새로운 가이드 기준)
 */
export function performTechnicalAnalysis(
  stockData: StockData[],
): TechnicalAnalysis | null {
  if (stockData.length < 50) {
    console.warn(`데이터가 부족합니다: ${stockData.length}개 (최소 50개 필요)`);
    return null;
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

  // 아룬 지표
  const aroon = calculateAroon({ high: highs, low: lows }, 14);

  // 엘더레이 지표
  const elderRay = calculateElderRay({ high: highs, low: lows, close: closes });

  // 포스 인덱스
  const forceIndex = calculateForceIndex({ close: closes, volume: volumes });

  // 스토캐스틱 RSI
  const stochRsi = calculateStochRSI(closes, 9);

  // 상대변동성지수
  const rvi = calculateRVI({ close: closes }, 10);

  // 스토캐스틱 모멘텀지수
  const smi = calculateSMI({ close: closes, high: highs, low: lows });

  // 거래량 오실레이터
  const volumeOscillator = calculateVolumeOscillator({ volume: volumes });

  return {
    sma5,
    sma20,
    sma120,
    dema5,
    dema20,
    dema120,
    macd,
    rsi,
    aroon,
    elderRay,
    forceIndex,
    stochRsi,
    rvi,
    chaikin: [], // A/D 라인 필요하므로 일단 빈 배열
    smi,
    volumeOscillator,
  };
}

/**
 * 점수 계산 및 추천 생성 (새로운 가이드 기준)
 */
export function calculateScore(analysis: TechnicalAnalysis): {
  shortScore: number;
  midLongScore: number;
  totalScore: number;
  recommendation: string;
} {
  // 가이드 기준 가중치 (⭐ 갯수 기준)
  const weights = {
    DEMA: 4.0, // ⭐⭐⭐⭐ 가격이동평균/DEMA
    MACD: 7.0, // ⭐⭐⭐⭐⭐⭐⭐ MACD
    AROON: 3.0, // ⭐⭐⭐ 아룬
    ELDER_RAY: 2.5, // ⭐⭐⭐☆ 엘더레이
    FORCE_INDEX: 1.0, // ⭐ 포스 인덱스
    STOCH_RSI: 4.0, // ⭐⭐⭐⭐ 상대강도 스토캐스틱
    RVI: 4.5, // ⭐⭐⭐⭐⭐☆ 상대변동성지수
    CHAIKIN: 3.0, // ⭐⭐⭐ 차이킨 오실레이터
    SMI: 3.0, // ⭐⭐⭐ 스토캐스틱 모멘텀지수
    VOLUME_OSC: 3.5, // ⭐⭐⭐⭐☆ 거래량 오실레이터
  };

  let shortScore = 0;
  let midLongScore = 0;

  // 신호별 점수 계산 함수
  const getSignalPoints = (signal: string, weight: number): number => {
    switch (signal) {
      case "강력매입":
        return 5.0 * weight;
      case "매입":
        return 5.0 * weight;
      case "강력매도":
        return -5.0 * weight;
      case "매도":
        return -5.0 * weight;
      case "약매입":
        return 3.0 * weight;
      case "약매도":
        return -3.0 * weight;
      default:
        return 0;
    }
  };

  // 1. DEMA 지표 분석 ⭐⭐⭐⭐
  const dema5 = analysis.dema5;
  const dema20 = analysis.dema20;
  const dema120 = analysis.dema120;

  // 단기: 5일/20일 교차
  if (dema5.length >= 2 && dema20.length >= 2) {
    const shortBuy =
      dema5[dema5.length - 2] <= dema20[dema20.length - 2] &&
      dema5[dema5.length - 1] > dema20[dema20.length - 1];
    const shortSell =
      dema5[dema5.length - 2] >= dema20[dema20.length - 2] &&
      dema5[dema5.length - 1] < dema20[dema20.length - 1];

    if (shortBuy) {
      shortScore += getSignalPoints("매입", weights.DEMA);
    } else if (shortSell) {
      shortScore += getSignalPoints("매도", weights.DEMA);
    }
  }

  // 중장기: 20일/120일 교차
  if (dema20.length >= 2 && dema120.length >= 2) {
    const midBuy =
      dema20[dema20.length - 2] <= dema120[dema120.length - 2] &&
      dema20[dema20.length - 1] > dema120[dema120.length - 1];
    const midSell =
      dema20[dema20.length - 2] >= dema120[dema120.length - 2] &&
      dema20[dema20.length - 1] < dema120[dema120.length - 1];

    if (midBuy) {
      midLongScore += getSignalPoints("매입", weights.DEMA);
    } else if (midSell) {
      midLongScore += getSignalPoints("매도", weights.DEMA);
    }
  }

  // 2. MACD 지표 분석 ⭐⭐⭐⭐⭐⭐⭐
  const macdValues = analysis.macd.MACD;
  const signalValues = analysis.macd.Signal;

  if (macdValues.length >= 1 && signalValues.length >= 1) {
    const currentMacd = macdValues[macdValues.length - 1];
    const currentSignal = signalValues[signalValues.length - 1];

    // 교차 신호 (기존)
    if (macdValues.length >= 2 && signalValues.length >= 2) {
      const macdBuy =
        macdValues[macdValues.length - 2] <=
          signalValues[signalValues.length - 2] &&
        macdValues[macdValues.length - 1] >
          signalValues[signalValues.length - 1];
      const macdSell =
        macdValues[macdValues.length - 2] >=
          signalValues[signalValues.length - 2] &&
        macdValues[macdValues.length - 1] <
          signalValues[signalValues.length - 1];

      if (macdBuy) {
        if (currentMacd < 0) {
          // MACD가 (-)면서 signal을 상향돌파 → 강력매입
          shortScore += getSignalPoints("강력매입", weights.MACD);
          midLongScore += getSignalPoints("강력매입", weights.MACD);
        } else {
          // MACD가 signal을 상향돌파 → 매입
          shortScore += getSignalPoints("매입", weights.MACD);
          midLongScore += getSignalPoints("매입", weights.MACD);
        }
      } else if (macdSell) {
        if (currentMacd > 0) {
          // MACD가 (+)면서 signal을 하향돌파 → 강력매도
          shortScore += getSignalPoints("강력매도", weights.MACD);
          midLongScore += getSignalPoints("강력매도", weights.MACD);
        } else {
          // MACD가 signal을 하향돌파 → 매도
          shortScore += getSignalPoints("매도", weights.MACD);
          midLongScore += getSignalPoints("매도", weights.MACD);
        }
      }
    }

    // 현재 위치 신호 (추가)
    if (currentMacd > currentSignal) {
      // MACD가 Signal 위에 있으면 약한 매수 신호
      shortScore += getSignalPoints("약매입", weights.MACD * 0.3);
      midLongScore += getSignalPoints("약매입", weights.MACD * 0.3);
    } else {
      // MACD가 Signal 아래에 있으면 약한 매도 신호
      shortScore += getSignalPoints("약매도", weights.MACD * 0.3);
      midLongScore += getSignalPoints("약매도", weights.MACD * 0.3);
    }
  }

  // 3. 아룬 지표 분석 ⭐⭐⭐
  const aroonUp = analysis.aroon.aroonUp;
  const aroonDown = analysis.aroon.aroonDown;

  if (aroonUp.length >= 2 && aroonDown.length >= 2) {
    const aroonBuy =
      aroonUp[aroonUp.length - 2] <= aroonDown[aroonDown.length - 2] &&
      aroonUp[aroonUp.length - 1] > aroonDown[aroonDown.length - 1];
    const aroonSell =
      aroonUp[aroonUp.length - 2] >= aroonDown[aroonDown.length - 2] &&
      aroonUp[aroonUp.length - 1] < aroonDown[aroonDown.length - 1];

    if (aroonBuy) {
      shortScore += getSignalPoints("매입", weights.AROON);
      midLongScore += getSignalPoints("매입", weights.AROON);
    } else if (aroonSell) {
      shortScore += getSignalPoints("매도", weights.AROON);
      midLongScore += getSignalPoints("매도", weights.AROON);
    }
  }

  // 4. 거래량 오실레이터 분석 ⭐⭐⭐⭐☆
  const volumeOsc = analysis.volumeOscillator;

  if (volumeOsc.length >= 2) {
    const voBuy =
      volumeOsc[volumeOsc.length - 2] <= 0 &&
      volumeOsc[volumeOsc.length - 1] > 0;
    const voSell =
      volumeOsc[volumeOsc.length - 2] >= 0 &&
      volumeOsc[volumeOsc.length - 1] < 0;

    if (voBuy) {
      shortScore += getSignalPoints("매입", weights.VOLUME_OSC);
      midLongScore += getSignalPoints("매입", weights.VOLUME_OSC);
    } else if (voSell) {
      shortScore += getSignalPoints("매도", weights.VOLUME_OSC);
      midLongScore += getSignalPoints("매도", weights.VOLUME_OSC);
    }
  }

  // 5. 스토캐스틱 RSI 분석 ⭐⭐⭐⭐
  const stochRsi = analysis.stochRsi;

  if (stochRsi.length >= 6) {
    const avgStochRsi = stochRsi.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const currentStochRsi = stochRsi[stochRsi.length - 1];
    const prevAvgStochRsi =
      stochRsi.slice(-6, -1).reduce((a, b) => a + b, 0) / 5;

    if (avgStochRsi <= 20 && currentStochRsi > 20 && prevAvgStochRsi <= 20) {
      shortScore += getSignalPoints("매입", weights.STOCH_RSI);
      midLongScore += getSignalPoints("매입", weights.STOCH_RSI);
    } else if (
      avgStochRsi >= 80 &&
      currentStochRsi < 80 &&
      prevAvgStochRsi >= 80
    ) {
      shortScore += getSignalPoints("매도", weights.STOCH_RSI);
      midLongScore += getSignalPoints("매도", weights.STOCH_RSI);
    }
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
