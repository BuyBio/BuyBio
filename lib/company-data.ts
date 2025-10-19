import fs from "fs";
import path from "path";

import * as XLSX from "xlsx";

// 엑셀 파일 경로
const EXCEL_PATH = path.join(process.cwd(), "data", "biolist.xlsx");
const CODE_EXCEL_PATH = path.join(
  process.cwd(),
  "data",
  "biolist_with_code.xlsx",
);

export interface CompanyData {
  tags: number[];
  summary: string;
  bio_industry_code: string;
  main_products: string;
  biotech_code: string;
  additional_desc: string;
}

export interface CompanyCodes {
  [companyName: string]: string;
}

/**
 * biolist.xlsx에서 기업 데이터를 로드하고 파싱합니다.
 */
export function loadCompanyData(): { [companyName: string]: CompanyData } {
  try {
    console.log("엑셀 파일 경로:", EXCEL_PATH);
    console.log("파일 존재 여부:", fs.existsSync(EXCEL_PATH));

    if (!fs.existsSync(EXCEL_PATH)) {
      throw new Error(`엑셀 파일이 존재하지 않습니다: ${EXCEL_PATH}`);
    }

    const buffer = fs.readFileSync(EXCEL_PATH);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log("로드된 데이터 개수:", jsonData.length);

    const companyData: { [companyName: string]: CompanyData } = {};

    for (const row of jsonData as any[]) {
      // A열: 추가 태그 (예: "1,7", "2,7", "1" 등)
      const tagsStr = String(row["추가 태그"] || "").trim();
      let tags: number[] = [];

      if (tagsStr && tagsStr !== "nan") {
        try {
          tags = tagsStr
            .split(",")
            .map((t) => parseInt(t.trim()))
            .filter((t) => !isNaN(t));
        } catch (error) {
          console.warn(`태그 파싱 오류: ${tagsStr}`);
          continue;
        }
      }

      // B열: 기업명
      const companyName = String(row["기업명"] || "").trim();
      if (!companyName || companyName === "nan") {
        continue;
      }

      // C열: 한 줄 요약
      const summary = String(row["한 줄 요약"] || "").trim();

      // D열: 바이오산업 분류코드
      const bioIndustryCode = String(row["바이오산업 분류코드"] || "").trim();

      // E열: 주력 상품/기술
      const mainProducts = String(row["주력 상품/기술"] || "").trim();

      // F열: 생명공학기술 분류코드
      const biotechCode = String(row["생명공학기술 분류코드"] || "").trim();

      // G열: 추가설명
      const additionalDesc = String(row["추가설명"] || "").trim();

      companyData[companyName] = {
        tags,
        summary,
        bio_industry_code: bioIndustryCode,
        main_products: mainProducts,
        biotech_code: biotechCode,
        additional_desc: additionalDesc,
      };
    }

    return companyData;
  } catch (error) {
    console.error("엑셀 파일 로드 오류:", error);
    return {};
  }
}

/**
 * biolist_with_code.xlsx에서 기업명과 종목코드 매핑을 로드합니다.
 */
export function loadCompanyCodes(): CompanyCodes {
  try {
    console.log("종목코드 엑셀 파일 경로:", CODE_EXCEL_PATH);
    console.log("파일 존재 여부:", fs.existsSync(CODE_EXCEL_PATH));

    if (!fs.existsSync(CODE_EXCEL_PATH)) {
      throw new Error(
        `종목코드 엑셀 파일이 존재하지 않습니다: ${CODE_EXCEL_PATH}`,
      );
    }

    const buffer = fs.readFileSync(CODE_EXCEL_PATH);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log("로드된 종목코드 데이터 개수:", jsonData.length);

    const companyCodes: CompanyCodes = {};

    for (const row of jsonData as any[]) {
      const companyName = String(row["회사명"] || "").trim();
      let code = String(row["종목코드"] || "").trim();

      if (!companyName || companyName === "nan" || !code || code === "nan") {
        continue;
      }

      // 종목코드를 6자리로 맞춤
      code = code.padStart(6, "0");
      companyCodes[companyName] = code;
    }

    return companyCodes;
  } catch (error) {
    console.error("종목코드 엑셀 로드 오류:", error);
    return {};
  }
}

/**
 * 특정 태그에 해당하는 기업들을 반환합니다.
 */
export function getCompaniesByTags(tags: number[]): string[] {
  const companyData = loadCompanyData();
  const matchingCompanies: string[] = [];

  for (const [companyName, data] of Object.entries(companyData)) {
    // 모든 태그가 포함되어 있는지 확인
    const hasAllTags = tags.every((tag) => data.tags.includes(tag));
    if (hasAllTags) {
      matchingCompanies.push(companyName);
    }
  }

  return matchingCompanies;
}

/**
 * 특정 태그 유형(1~11)에 해당하는 기업들을 반환합니다.
 */
export function getCompaniesBySurveyType(type: number): string[] {
  if (type < 1 || type > 11) {
    return [];
  }
  return getCompaniesByTags([type]);
}
