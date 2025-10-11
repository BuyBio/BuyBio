from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from calc_logic import analyze_from_excel, analyze_by_survey_type, analyze_all_survey_types, get_buy_recommendations_by_type, get_all_buy_recommendations

app = FastAPI()

# CORS: 배포 시 allow_origins를 서비스 도메인으로 제한하세요
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "서버가 정상적으로 실행 중입니다!"}


@app.get("/test")
def test():
    try:
        from calc_logic import load_company_data
        company_data = load_company_data()
        return {"message": "calc_logic 모듈 로드 성공", "company_count": len(company_data)}
    except Exception as e:
        return {"error": str(e)}


@app.get("/debug")
def debug():
    """디버깅용 엔드포인트 - 기업 데이터와 태그 정보 확인"""
    try:
        from calc_logic import load_company_data
        company_data = load_company_data()
        
        # 각 기업의 태그 정보 출력
        companies_with_tags = {}
        for name, data in company_data.items():
            companies_with_tags[name] = {
                "tags": data["tags"],
                "summary": data["summary"][:50] + "..." if len(data["summary"]) > 50 else data["summary"]
            }
        
        return {
            "total_companies": len(company_data),
            "companies": companies_with_tags
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/debug-codes")
def debug_codes():
    """디버깅용 엔드포인트 - 종목코드 매핑 확인"""
    try:
        from calc_logic import load_company_codes
        company_codes = load_company_codes()
        
        # 처음 10개만 출력
        sample_codes = dict(list(company_codes.items())[:10])
        
        return {
            "total_codes": len(company_codes),
            "sample_codes": sample_codes
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/analyze")
def analyze():
    results = analyze_from_excel()
    return {"results": results}


@app.get("/analyze-by-type")
def analyze_by_type(type: int = Query(..., ge=1, le=11, description="설문 유형 번호 (1~11)")):
    """
    특정 설문 유형에 해당하는 기업들의 분석 결과를 반환합니다.
    """
    result = analyze_by_survey_type(type)
    return result


@app.get("/analyze-all-types")
def analyze_all_types():
    """
    모든 설문 유형(1~11)에 대한 분석 결과를 반환합니다.
    """
    results = analyze_all_survey_types()
    return results


@app.get("/buy-recommendations-by-type")
def buy_recommendations_by_type(type: int = Query(..., ge=1, le=11, description="설문 유형 번호 (1~11)"), limit: int = Query(10, ge=1, le=50, description="반환할 기업 수 (1~50)")):
    """
    특정 설문 유형에서 매수 추천 기업들을 점수 높은 순으로 반환합니다.
    """
    result = get_buy_recommendations_by_type(type, limit)
    return result


@app.get("/all-buy-recommendations")
def all_buy_recommendations(limit: int = Query(20, ge=1, le=100, description="반환할 기업 수 (1~100)")):
    """
    모든 설문 유형에서 매수 추천 기업들을 점수 높은 순으로 반환합니다.
    """
    result = get_all_buy_recommendations(limit)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


