import os
from pathlib import Path
import FinanceDataReader as fdr
import pandas as pd
import numpy as np
from typing import Dict, List, Optional

# 엑셀 파일 경로
# 기본값: backend/data/biolist.xlsx
# 환경변수 EXCEL_PATH로 덮어쓰기 가능
DEFAULT_EXCEL = Path(__file__).parent / "data" / "biolist.xlsx"
EXCEL_PATH = os.getenv("EXCEL_PATH", str(DEFAULT_EXCEL))

# 종목코드가 포함된 엑셀 파일 경로
DEFAULT_CODE_EXCEL = Path(__file__).parent / "data" / "biolist_with_code.xlsx"
CODE_EXCEL_PATH = os.getenv("CODE_EXCEL_PATH", str(DEFAULT_CODE_EXCEL))


def dema(series: pd.Series, length: int) -> pd.Series:
    """
    DEMA (Double Exponential Moving Average) 계산
    """
    ema1 = series.ewm(span=length).mean()
    ema2 = ema1.ewm(span=length).mean()
    return 2 * ema1 - ema2


def macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
    """
    MACD 계산
    """
    ema_fast = series.ewm(span=fast).mean()
    ema_slow = series.ewm(span=slow).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal).mean()
    histogram = macd_line - signal_line
    
    return {
        "MACD": macd_line,
        "Signal": signal_line,
        "Histogram": histogram
    }


def load_company_data() -> Dict[str, Dict]:
    """
    biolist.xlsx에서 기업 데이터를 로드하고 파싱합니다.
    
    Returns:
        Dict[str, Dict]: {기업명: {tags: [1,7], summary: "...", ...}} 형태의 딕셔너리
    """
    try:
        df = pd.read_excel(EXCEL_PATH)
    except FileNotFoundError:
        print(f"엑셀 파일을 찾을 수 없습니다: {EXCEL_PATH}")
        return {}
    except Exception as e:
        print(f"엑셀 로드 오류: {e}")
        return {}
    
    company_data = {}
    
    for _, row in df.iterrows():
        # A열: 추가 태그 (예: "1,7", "2,7", "1" 등)
        tags_str = str(row.get("추가 태그", "")).strip()
        tags = []
        if tags_str and tags_str != "nan":
            try:
                # 쉼표로 구분된 태그들을 정수로 변환
                tags = [int(t.strip()) for t in tags_str.split(",") if t.strip().isdigit()]
            except ValueError:
                print(f"태그 파싱 오류: {tags_str}")
                continue
        
        # B열: 기업명
        company_name = str(row.get("기업명", "")).strip()
        if not company_name or company_name == "nan":
            continue
            
        # C열: 한 줄 요약
        summary = str(row.get("한 줄 요약", "")).strip()
        if summary == "nan":
            summary = ""
            
        # D열: 바이오산업 분류코드
        bio_industry_code = str(row.get("바이오산업 분류코드", "")).strip()
        if bio_industry_code == "nan":
            bio_industry_code = ""
            
        # E열: 주력 상품/기술
        main_products = str(row.get("주력 상품/기술", "")).strip()
        if main_products == "nan":
            main_products = ""
            
        # F열: 생명공학기술 분류코드
        biotech_code = str(row.get("생명공학기술 분류코드", "")).strip()
        if biotech_code == "nan":
            biotech_code = ""
            
        # G열: 추가설명
        additional_desc = str(row.get("추가설명", "")).strip()
        if additional_desc == "nan":
            additional_desc = ""
        
        company_data[company_name] = {
            "tags": tags,
            "summary": summary,
            "bio_industry_code": bio_industry_code,
            "main_products": main_products,
            "biotech_code": biotech_code,
            "additional_desc": additional_desc
        }
    
    return company_data


def load_company_codes() -> Dict[str, str]:
    """
    biolist_with_code.xlsx에서 기업명과 종목코드 매핑을 로드합니다.
    
    Returns:
        Dict[str, str]: {기업명: 종목코드} 형태의 딕셔너리
    """
    try:
        df = pd.read_excel(CODE_EXCEL_PATH)
    except FileNotFoundError:
        print(f"종목코드 엑셀 파일을 찾을 수 없습니다: {CODE_EXCEL_PATH}")
        return {}
    except Exception as e:
        print(f"종목코드 엑셀 로드 오류: {e}")
        return {}
    
    company_codes = {}
    
    for _, row in df.iterrows():
        # 기업명과 종목코드 추출 (열 이름은 실제 파일에 맞게 조정 필요)
        company_name = str(row.get("회사명", "")).strip()
        code = str(row.get("종목코드", "")).strip()
        
        if not company_name or company_name == "nan" or not code or code == "nan":
            continue
            
        # 종목코드를 6자리로 맞춤
        code = code.zfill(6)
        company_codes[company_name] = code
    
    return company_codes


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
            dema5 = dema(close, length=5)
            dema20 = dema(close, length=20)
            dema120 = dema(close, length=120)

            # 2) MACD (12, 26, 9)
            macd_data = macd(close)
            macd_raw = macd_data["MACD"].iloc[-1]
            macd_sig_raw = macd_data["Signal"].iloc[-1]
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


def analyze_stock(code: str, name: str) -> Optional[Dict]:
    """
    개별 종목에 대한 기술적 분석을 수행합니다.
    
    Args:
        code: 종목코드 (6자리 문자열)
        name: 회사명
        
    Returns:
        분석 결과 딕셔너리 또는 None (분석 실패시)
    """
    try:
        stock = fdr.DataReader(code)
        if stock is None or len(stock) < 120:
            return None

        close = stock["Close"].astype(float)
        vol = stock["Volume"].astype(float) if "Volume" in stock.columns else None

        # ----- 지표 계산 -----
        # 1) 이동평균/DEMA 교차 (단기: 5/20, 중장기: 20/120)
        sma5, sma20, sma120 = close.rolling(5).mean(), close.rolling(20).mean(), close.rolling(120).mean()
        dema5 = dema(close, length=5)
        dema20 = dema(close, length=20)
        dema120 = dema(close, length=120)

        # 2) MACD (12, 26, 9)
        macd_data = macd(close)
        macd_raw = macd_data["MACD"].iloc[-1]
        macd_sig_raw = macd_data["Signal"].iloc[-1]
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
        mid_buy = (dema20.iloc[-2] <= dema120.iloc[-2] and dema20.iloc[-1] > dema120.iloc[-1]) if not dema20.isna().iloc[-1] else (sma20.iloc[-2] <= dema120.iloc[-2] and sma20.iloc[-1] > sma120.iloc[-1])
        mid_sell = (dema20.iloc[-2] >= dema120.iloc[-2] and dema20.iloc[-1] < dema120.iloc[-1]) if not dema20.isna().iloc[-1] else (sma20.iloc[-2] >= dema120.iloc[-2] and sma20.iloc[-1] < sma20.iloc[-1])
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

        return {
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
    except Exception as e:
        print(f"{name} ({code}) 오류: {e}")
        return None


def analyze_by_survey_type(survey_type: int) -> Dict:
    """
    특정 설문 유형에 해당하는 기업들을 분석합니다.
    
    Args:
        survey_type: 설문 유형 번호 (1~11)
        
    Returns:
        설문 유형별 분석 결과 딕셔너리
    """
    # 기업 데이터와 종목코드 로드
    company_data = load_company_data()
    company_codes = load_company_codes()
    
    # 해당 유형에 속하는 기업들 필터링
    target_companies = []
    for company_name, data in company_data.items():
        if survey_type in data["tags"]:
            target_companies.append({
                "name": company_name,
                "company_info": data
            })
    
    # 각 기업에 대해 분석 수행
    companies = []
    for company in target_companies:
        company_name = company["name"]
        company_info = company["company_info"]
        
        # 종목코드 찾기
        stock_code = company_codes.get(company_name, None)
        
        if stock_code:
            # 종목코드가 있으면 실제 분석 수행
            result = analyze_stock(stock_code, company_name)
            if result:
                # 기업 정보 추가
                result.update({
                    "company_info": company_info,
                    "survey_type": survey_type
                })
                companies.append(result)
        else:
            # 종목코드가 없으면 기본 정보만 반환
            company_result = {
                "name": company_name,
                "code": "N/A",
                "recommendation": "분석 불가 (종목코드 없음)",
                "scores": {
                    "short_term": 0.0,
                    "mid_long_term": 0.0,
                    "total": 0.0,
                },
                "indicators": {
                    "macd": None,
                    "signal": None,
                    "dema5": None,
                    "dema20": None,
                    "dema120": None,
                    "vo_cross_up": False,
                    "vo_cross_down": False,
                },
                "company_info": company_info,
                "survey_type": survey_type
            }
            companies.append(company_result)
    
    return {
        "survey_type": survey_type,
        "companies": companies,
        "total_count": len(companies)
    }


def analyze_all_survey_types() -> Dict:
    """
    모든 설문 유형(1~11)에 대한 분석을 수행합니다.
    
    Returns:
        모든 유형별 분석 결과 딕셔너리
    """
    all_results = {}
    
    for survey_type in range(1, 12):  # 1~11
        result = analyze_by_survey_type(survey_type)
        all_results[f"type_{survey_type}"] = result
    
    return all_results


def get_buy_recommendations_by_type(survey_type: int, limit: int = 10) -> Dict:
    """
    특정 설문 유형에서 매수 추천 기업들을 점수 높은 순으로 반환합니다.
    
    Args:
        survey_type: 설문 유형 번호 (1~11)
        limit: 반환할 기업 수 (기본값: 10)
        
    Returns:
        매수 추천 기업들의 딕셔너리 (점수 높은 순)
    """
    # 해당 유형의 모든 기업 분석
    result = analyze_by_survey_type(survey_type)
    
    # 매수 추천만 필터링
    buy_recommendations = [
        company for company in result["companies"] 
        if company["recommendation"] == "매수 추천"
    ]
    
    # 총 점수 기준으로 내림차순 정렬
    buy_recommendations.sort(key=lambda x: x["scores"]["total"], reverse=True)
    
    # limit만큼만 반환
    top_buy_recommendations = buy_recommendations[:limit]
    
    return {
        "survey_type": survey_type,
        "buy_recommendations": top_buy_recommendations,
        "total_buy_count": len(buy_recommendations),
        "returned_count": len(top_buy_recommendations)
    }


def get_all_buy_recommendations(limit: int = 20) -> Dict:
    """
    모든 설문 유형에서 매수 추천 기업들을 점수 높은 순으로 반환합니다.
    
    Args:
        limit: 반환할 기업 수 (기본값: 20)
        
    Returns:
        모든 매수 추천 기업들의 딕셔너리 (점수 높은 순)
    """
    all_buy_companies = []
    
    # 모든 유형에서 매수 추천 기업들 수집
    for survey_type in range(1, 12):
        result = analyze_by_survey_type(survey_type)
        buy_companies = [
            company for company in result["companies"] 
            if company["recommendation"] == "매수 추천"
        ]
        all_buy_companies.extend(buy_companies)
    
    # 총 점수 기준으로 내림차순 정렬
    all_buy_companies.sort(key=lambda x: x["scores"]["total"], reverse=True)
    
    # limit만큼만 반환
    top_buy_recommendations = all_buy_companies[:limit]
    
    return {
        "all_buy_recommendations": top_buy_recommendations,
        "total_buy_count": len(all_buy_companies),
        "returned_count": len(top_buy_recommendations)
    }


