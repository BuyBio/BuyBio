import os
from pathlib import Path
import FinanceDataReader as fdr
import pandas_ta as ta
import pandas as pd

# 엑셀 파일 경로
# 기본값: backend/data/상장법인목록.xlsx
# 환경변수 EXCEL_PATH로 덮어쓰기 가능
DEFAULT_EXCEL = Path(__file__).parent / "data" / "biolist.xlsx"
EXCEL_PATH = os.getenv("EXCEL_PATH", str(DEFAULT_EXCEL))


def analyze_from_excel():
    try:
        df = pd.read_excel(EXCEL_PATH)
    except FileNotFoundError:
        print(f"엑셀 파일을 찾을 수 없습니다: {EXCEL_PATH}")
        return []
    except Exception as e:
        print(f"엑셀 로드 오류: {e}")
        return []

    results = []

    for _, row in df.iterrows():
        code = str(row.get("종목코드", "")).zfill(6)
        name = row.get("회사명", "N/A")

        if not code or code == "000000":
            continue

        try:
            stock = fdr.DataReader(code)
            if stock is None or len(stock) < 120:
                continue

            close = stock["Close"].astype(float)
            vol = stock["Volume"].astype(float) if "Volume" in stock.columns else None

            # ----- 지표 계산 -----
            # 1) 이동평균/DEMA 교차 (단기: 5/20, 중장기: 20/120)
            sma5, sma20, sma120 = close.rolling(5).mean(), close.rolling(20).mean(), close.rolling(120).mean()
            dema5 = ta.dema(close, length=5)
            dema20 = ta.dema(close, length=20)
            dema120 = ta.dema(close, length=120)

            # 2) MACD (12, 26, 9)
            macd_df = ta.macd(close)
            macd_raw = macd_df["MACD_12_26_9"].iloc[-1]
            macd_sig_raw = macd_df["MACDs_12_26_9"].iloc[-1]
            macd_val = None if pd.isna(macd_raw) else float(macd_raw)
            macd_sig = None if pd.isna(macd_sig_raw) else float(macd_sig_raw)

            # 3) 거래량 오실레이터 (VO = SMA5(volume) - SMA20(volume))
            vo_cross_up = False
            vo_cross_down = False
            if vol is not None:
                v5, v20 = vol.rolling(5).mean(), vol.rolling(20).mean()
                vo = v5 - v20
                if len(vo) >= 2:
                    vo_cross_up = bool((vo.iloc[-2] <= 0) and (vo.iloc[-1] > 0))
                    vo_cross_down = bool((vo.iloc[-2] >= 0) and (vo.iloc[-1] < 0))

            # ----- 점수 산정 -----
            short_score = 0.0
            midlong_score = 0.0

            # 가중치 (별 갯수; 반개=0.5)
            W_MA = 4.0          # 가격이동평균/DEMA
            W_MACD = 7.0        # MACD
            W_VO = 3.5          # 거래량 오실레이터 ⭐⭐⭐☆

            # 신호 점수 규칙
            def pts_basic(sig: int, weight: float) -> float:
                # sig: +1 매입, -1 매도, 0 중립
                return (5.0 if sig > 0 else (-5.0 if sig < 0 else 0.0)) * weight

            # (A) 단기: 5/20 교차 (DEMA 우선, 없으면 SMA)
            short_buy = (dema5.iloc[-2] <= dema20.iloc[-2] and dema5.iloc[-1] > dema20.iloc[-1]) if not dema5.isna().iloc[-1] else (sma5.iloc[-2] <= sma20.iloc[-2] and sma5.iloc[-1] > sma20.iloc[-1])
            short_sell = (dema5.iloc[-2] >= dema20.iloc[-2] and dema5.iloc[-1] < dema20.iloc[-1]) if not dema5.isna().iloc[-1] else (sma5.iloc[-2] >= sma20.iloc[-2] and sma5.iloc[-1] < sma20.iloc[-1])
            short_score += pts_basic(1 if short_buy else (-1 if short_sell else 0), W_MA)

            # (B) 중장기: 20/120 교차 (DEMA 우선)
            mid_buy = (dema20.iloc[-2] <= dema120.iloc[-2] and dema20.iloc[-1] > dema120.iloc[-1]) if not dema20.isna().iloc[-1] else (sma20.iloc[-2] <= sma120.iloc[-2] and sma20.iloc[-1] > sma120.iloc[-1])
            mid_sell = (dema20.iloc[-2] >= dema120.iloc[-2] and dema20.iloc[-1] < dema120.iloc[-1]) if not dema20.isna().iloc[-1] else (sma20.iloc[-2] >= sma120.iloc[-2] and sma20.iloc[-1] < sma120.iloc[-1])
            midlong_score += pts_basic(1 if mid_buy else (-1 if mid_sell else 0), W_MA)

            # (C) MACD 교차 (공통 지표로 양쪽에 반영)
            macd_buy = (macd_val is not None and macd_sig is not None and macd_val > macd_sig)
            macd_sell = (macd_val is not None and macd_sig is not None and macd_val < macd_sig)
            short_score += pts_basic(1 if macd_buy else (-1 if macd_sell else 0), W_MACD)
            midlong_score += pts_basic(1 if macd_buy else (-1 if macd_sell else 0), W_MACD)

            # (D) 거래량 오실레이터 교차
            if vo_cross_up:
                short_score += pts_basic(1, W_VO)
                midlong_score += pts_basic(1, W_VO)
            elif vo_cross_down:
                short_score += pts_basic(-1, W_VO)
                midlong_score += pts_basic(-1, W_VO)

            # 요약 추천
            rec = "매수 추천" if (short_score + midlong_score) > 0 else "매도 추천"

            def safe_float(x):
                return None if (x is None or pd.isna(x)) else float(x)

            results.append(
                {
                    "code": code,
                    "name": name,
                    "recommendation": rec,
                    "scores": {
                        "short_term": round(float(short_score), 2),
                        "mid_long_term": round(float(midlong_score), 2),
                        "total": round(float(short_score + midlong_score), 2),
                    },
                    "indicators": {
                        "macd": safe_float(macd_val),
                        "signal": safe_float(macd_sig),
                        "dema5": safe_float(dema5.iloc[-1]),
                        "dema20": safe_float(dema20.iloc[-1]),
                        "dema120": safe_float(dema120.iloc[-1]),
                        "vo_cross_up": bool(vo_cross_up),
                        "vo_cross_down": bool(vo_cross_down),
                    },
                }
            )
        except Exception as e:
            # 에러는 건너뛰고 계속 진행
            print(f"{name} ({code}) 오류: {e}")
            continue

    return results


