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
  ema13: number[]; // 엘더레이 분석용
  closes: number[]; // 엘더레이 분석용 (주가 데이터)
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
 * 가이드 기준: MACD = 9일간 지수이동평균 - 26일간 지수이동평균
 * Signal = MACD의 13일간 지수이동평균
 */
export function calculateMACD(data: number[]): {
  MACD: number[];
  Signal: number[];
  Histogram: number[];
} {
  const macdResult = MACD.calculate({
    values: data,
    fastPeriod: 9,
    slowPeriod: 26,
    signalPeriod: 13,
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
  if (stockData.length < 30) {
    console.warn(`데이터가 부족합니다: ${stockData.length}개 (최소 30개 필요)`);
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

  // EMA13 계산 (엘더레이 분석용)
  const ema13 = EMA.calculate({ values: closes, period: 13 });

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
    ema13,
    closes, // 주가 데이터 저장
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
  const closesForVolume = analysis.closes;

  if (volumeOsc.length >= 2 && closesForVolume.length >= 2) {
    const prevVo = volumeOsc[volumeOsc.length - 2];
    const currentVo = volumeOsc[volumeOsc.length - 1];
    const prevClose = closesForVolume[closesForVolume.length - 2];
    const currentClose = closesForVolume[closesForVolume.length - 1];

    // 거래량 오실레이터가 0선을 아래에서 위로 상향돌파 → 매입
    const voBuy = prevVo <= 0 && currentVo > 0;
    // 거래량 오실레이터가 0선을 위에서 아래로 하향돌파 → 매도
    const voSell = prevVo >= 0 && currentVo < 0;

    // 주가가 하락하는지 확인
    const priceFalling = currentClose < prevClose;
    // 주가가 상승하는지 확인
    const priceRising = currentClose > prevClose;
    // 거래량 오실레이터가 늘어나는지 확인
    const voIncreasing = currentVo > prevVo;
    // 거래량 오실레이터가 줄어드는지 확인
    const voDecreasing = currentVo < prevVo;

    if (voBuy) {
      // 주가는 하락하는데 거래량 오실레이터가 늘어남 → 강력매입
      if (priceFalling && voIncreasing) {
        shortScore += getSignalPoints("강력매입", weights.VOLUME_OSC);
        midLongScore += getSignalPoints("강력매입", weights.VOLUME_OSC);
      } else {
        shortScore += getSignalPoints("매입", weights.VOLUME_OSC);
        midLongScore += getSignalPoints("매입", weights.VOLUME_OSC);
      }
    } else if (voSell) {
      // 주가는 상승하는데 거래량 오실레이터가 줄어듦 → 강력매도
      if (priceRising && voDecreasing) {
        shortScore += getSignalPoints("강력매도", weights.VOLUME_OSC);
        midLongScore += getSignalPoints("강력매도", weights.VOLUME_OSC);
      } else {
        shortScore += getSignalPoints("매도", weights.VOLUME_OSC);
        midLongScore += getSignalPoints("매도", weights.VOLUME_OSC);
      }
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

  // 6. 엘더레이 강세/약세지수 분석 ⭐⭐⭐☆
  const elderRay = analysis.elderRay;
  const ema13 = analysis.ema13;
  const closes = analysis.closes;

  if (
    elderRay.bull.length >= 2 &&
    elderRay.bear.length >= 2 &&
    ema13.length >= 2 &&
    closes.length >= 2
  ) {
    const currentBull = elderRay.bull[elderRay.bull.length - 1];
    const currentBear = elderRay.bear[elderRay.bear.length - 1];
    const prevBull = elderRay.bull[elderRay.bull.length - 2];
    const prevBear = elderRay.bear[elderRay.bear.length - 2];
    const currentEma = ema13[ema13.length - 1];
    const prevEma = ema13[ema13.length - 2];
    const currentClose = closes[closes.length - 1];
    const prevClose = closes[closes.length - 2];

    // EMA가 상승세인지 확인
    const emaRising = currentEma > prevEma;
    // EMA가 하락세인지 확인
    const emaFalling = currentEma < prevEma;

    // '지수이동평균(EMA)이 상승세이고', 'ERayBear 가 (-)상태에 있으나 점차 증가'→매입
    if (emaRising && currentBear < 0 && currentBear > prevBear) {
      // 추가 조건: 'ERayBull 이 전고점을 넘었고', 'ERayBear와 주가의 관계에서 다이버전스가 나타난다'→강력매입
      // 전고점 찾기 (최근 20일 중)
      const bullHistory = elderRay.bull.slice(-20);
      const maxBull = Math.max(...bullHistory.slice(0, -1)); // 현재를 제외한 최고값
      const bearHistory = elderRay.bear.slice(-20);
      const closeHistory = closes.slice(-20);

      // ERayBull이 전고점을 넘었는지 확인
      const bullExceeded = currentBull > maxBull;

      // 다이버전스 확인: 주가가 하락하는데 ERayBear가 상승 (강세 다이버전스)
      let divergence = false;
      if (closeHistory.length >= 5) {
        const recentCloses = closeHistory.slice(-5);
        const recentBears = bearHistory.slice(-5);
        // 주가는 하락 추세인데 ERayBear는 상승 추세
        const priceTrend =
          recentCloses[recentCloses.length - 1] <
          recentCloses[recentCloses.length - 3];
        const bearTrend =
          recentBears[recentBears.length - 1] >
          recentBears[recentBears.length - 3];
        divergence = priceTrend && bearTrend;
      }

      if (bullExceeded && divergence) {
        shortScore += getSignalPoints("강력매입", weights.ELDER_RAY);
        midLongScore += getSignalPoints("강력매입", weights.ELDER_RAY);
      } else {
        shortScore += getSignalPoints("매입", weights.ELDER_RAY);
        midLongScore += getSignalPoints("매입", weights.ELDER_RAY);
      }
    }

    // '지수이동평균(EMA)이 하락세이고', 'ERayBull 이 (+)상태에 있으나 점차 감소'→매도
    if (emaFalling && currentBull > 0 && currentBull < prevBull) {
      // 추가 조건: 'ERayBear 의 저점이 전저점 보다낮고', 'ERayBull과 주가의 관계에서 다이버전스가 나타난다'→강력매도
      const bearHistory = elderRay.bear.slice(-20);
      const minBear = Math.min(...bearHistory.slice(0, -1)); // 현재를 제외한 최저값
      const bullHistory = elderRay.bull.slice(-20);
      const closeHistory = closes.slice(-20);

      // ERayBear의 저점이 전저점보다 낮은지 확인
      const bearLower = currentBear < minBear;

      // 다이버전스 확인: 주가가 상승하는데 ERayBull이 하락 (약세 다이버전스)
      let divergence = false;
      if (closeHistory.length >= 5) {
        const recentCloses = closeHistory.slice(-5);
        const recentBulls = bullHistory.slice(-5);
        // 주가는 상승 추세인데 ERayBull은 하락 추세
        const priceTrend =
          recentCloses[recentCloses.length - 1] >
          recentCloses[recentCloses.length - 3];
        const bullTrend =
          recentBulls[recentBulls.length - 1] <
          recentBulls[recentBulls.length - 3];
        divergence = priceTrend && bullTrend;
      }

      if (bearLower && divergence) {
        shortScore += getSignalPoints("강력매도", weights.ELDER_RAY);
        midLongScore += getSignalPoints("강력매도", weights.ELDER_RAY);
      } else {
        shortScore += getSignalPoints("매도", weights.ELDER_RAY);
        midLongScore += getSignalPoints("매도", weights.ELDER_RAY);
      }
    }
  }

  // 7. 포스 인덱스 분석 ⭐
  const forceIndex = analysis.forceIndex;
  const closesForForce = analysis.closes;

  if (forceIndex.length >= 2 && closesForForce.length >= 2) {
    const currentForce = forceIndex[forceIndex.length - 1];
    const prevForce = forceIndex[forceIndex.length - 2];
    const currentClose = closesForForce[closesForForce.length - 1];
    const prevClose = closesForForce[closesForForce.length - 2];

    // 주가가 하락 중인지 확인
    const priceFalling = currentClose < prevClose;
    // 주가가 상승 중인지 확인
    const priceRising = currentClose > prevClose;

    // 포스 인덱스가 어제에 비해 크게 늘어나면 시장 상승추세가 강력
    const forceIncreasing = currentForce > prevForce * 1.1;
    // 포스 인덱스가 어제에 비해 크게 감소하면 시장 하락추세가 강력
    const forceDecreasing = currentForce < prevForce * 0.9;

    // 주가가 하락 중인데 포스 인덱스가 늘고 있으면 조만간 상승세 → 매입
    if (priceFalling && forceIncreasing) {
      shortScore += getSignalPoints("매입", weights.FORCE_INDEX);
      midLongScore += getSignalPoints("매입", weights.FORCE_INDEX);
    }
    // 주가가 상승 중인데 포스 인덱스가 줄고 있으면 조만간 하락세 → 매도
    else if (priceRising && forceDecreasing) {
      shortScore += getSignalPoints("매도", weights.FORCE_INDEX);
      midLongScore += getSignalPoints("매도", weights.FORCE_INDEX);
    }
  }

  // 8. 상대변동성지수 (RVI) 분석 ⭐⭐⭐⭐⭐☆
  const rvi = analysis.rvi;
  if (rvi.length >= 20) {
    // RVI의 5일 이동평균과 20일 이동평균 계산
    const rvi5 = rvi.slice(-5);
    const rvi20 = rvi.slice(-20);
    const rvi5Avg = rvi5.reduce((a, b) => a + b, 0) / rvi5.length;
    const rvi20Avg = rvi20.reduce((a, b) => a + b, 0) / rvi20.length;

    // 이전 기간의 평균도 계산
    const prevRvi5 = rvi.slice(-6, -1);
    const prevRvi20 = rvi.slice(-21, -1);
    const prevRvi5Avg = prevRvi5.reduce((a, b) => a + b, 0) / prevRvi5.length;
    const prevRvi20Avg =
      prevRvi20.reduce((a, b) => a + b, 0) / prevRvi20.length;

    const currentRvi = rvi[rvi.length - 1];

    // RVI > 50 & RVI의 5일이동평균이 20일이동평균을 상향돌파 → 매입
    if (currentRvi > 50 && prevRvi5Avg <= prevRvi20Avg && rvi5Avg > rvi20Avg) {
      shortScore += getSignalPoints("매입", weights.RVI);
      midLongScore += getSignalPoints("매입", weights.RVI);
    }
    // RVI ≥ 60 (무시된 매수 신호 이후) → 강력 매입
    else if (currentRvi >= 60) {
      shortScore += getSignalPoints("강력매입", weights.RVI);
      midLongScore += getSignalPoints("강력매입", weights.RVI);
    }
    // RVI < 50 & RVI의 5일이동평균이 20일이동평균을 하향돌파 → 매도
    else if (
      currentRvi < 50 &&
      prevRvi5Avg >= prevRvi20Avg &&
      rvi5Avg < rvi20Avg
    ) {
      shortScore += getSignalPoints("매도", weights.RVI);
      midLongScore += getSignalPoints("매도", weights.RVI);
    }
    // RVI ≤ 40 (무시된 매도 신호 이후) → 강력 매도
    else if (currentRvi <= 40) {
      shortScore += getSignalPoints("강력매도", weights.RVI);
      midLongScore += getSignalPoints("강력매도", weights.RVI);
    }
  }

  // 9. 스토캐스틱 모멘텀지수 (SMI) 분석 ⭐⭐⭐
  const smi = analysis.smi;
  if (smi.length >= 14) {
    // SMI의 signal 계산 (EMA(SMI))
    const smiSignal = EMA.calculate({ values: smi, period: 13 });

    if (smi.length >= 2 && smiSignal.length >= 2) {
      const smiBuy =
        smi[smi.length - 2] <= smiSignal[smiSignal.length - 2] &&
        smi[smi.length - 1] > smiSignal[smiSignal.length - 1];
      const smiSell =
        smi[smi.length - 2] >= smiSignal[smiSignal.length - 2] &&
        smi[smi.length - 1] < smiSignal[smiSignal.length - 1];

      if (smiBuy) {
        shortScore += getSignalPoints("매입", weights.SMI);
        midLongScore += getSignalPoints("매입", weights.SMI);
      } else if (smiSell) {
        shortScore += getSignalPoints("매도", weights.SMI);
        midLongScore += getSignalPoints("매도", weights.SMI);
      }
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
