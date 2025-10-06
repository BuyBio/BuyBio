from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from calc_logic import analyze_from_excel

app = FastAPI()

# CORS: 배포 시 allow_origins를 서비스 도메인으로 제한하세요
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/analyze")
def analyze():
    results = analyze_from_excel()
    return {"results": results}


