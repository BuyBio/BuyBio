import { NextResponse } from "next/server";

import {
  getCompaniesBySurveyType,
  loadCompanyCodes,
  loadCompanyData,
} from "@/lib/company-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const action = searchParams.get("action");

    // 기본 기업 데이터 로드
    if (action === "all" || !action) {
      const companyData = loadCompanyData();
      const companyCodes = loadCompanyCodes();

      return NextResponse.json({
        success: true,
        data: {
          companies: companyData,
          codes: companyCodes,
          totalCompanies: Object.keys(companyData).length,
          totalCodes: Object.keys(companyCodes).length,
        },
      });
    }

    // 특정 설문 유형에 해당하는 기업들
    if (action === "by-type" && type) {
      const surveyType = parseInt(type);
      if (isNaN(surveyType) || surveyType < 1 || surveyType > 11) {
        return NextResponse.json(
          { success: false, error: "설문 유형은 1~11 사이의 숫자여야 합니다." },
          { status: 400 },
        );
      }

      const companies = getCompaniesBySurveyType(surveyType);

      return NextResponse.json({
        success: true,
        data: {
          surveyType,
          companies,
          count: companies.length,
        },
      });
    }

    // 디버그 정보
    if (action === "debug") {
      const companyData = loadCompanyData();
      const companyCodes = loadCompanyCodes();

      // 각 기업의 태그 정보 요약
      const companiesWithTags = Object.entries(companyData).map(
        ([name, data]) => ({
          name,
          tags: data.tags,
          summary:
            data.summary.substring(0, 50) +
            (data.summary.length > 50 ? "..." : ""),
        }),
      );

      // 처음 10개 종목코드 샘플
      const sampleCodes = Object.entries(companyCodes).slice(0, 10);

      return NextResponse.json({
        success: true,
        data: {
          totalCompanies: Object.keys(companyData).length,
          totalCodes: Object.keys(companyCodes).length,
          companiesSample: companiesWithTags.slice(0, 10),
          codesSample: Object.fromEntries(sampleCodes),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "잘못된 action 파라미터입니다." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Companies API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
