import { readFileSync } from "node:fs";
import { join } from "node:path";

import * as XLSX from "xlsx";

export interface Company {
  name: string;
  tag: string;
  price?: string;
  change?: string;
  summary?: string;
  description?: string;
  relevance?: number;
}

export interface KeywordSection {
  keyword: string;
  desc: string;
  companies: Company[];
}

const KEYWORD_DESCRIPTIONS: Record<string, string> = {
  "신약 개발": "신약 개발 성과를 바탕으로 성장을 노리는 기업",
  "안정 성장": "안정적인 매출을 기반으로 꾸준히 크는 기업",
  위탁생산: "생산을 맡아 안정적으로 확장하는 기업",
  원천기술: "기술 가치에 따라 단기 움직임이 큰 기업",
  "시장 이벤트": "시장 이슈와 이벤트에 빠르게 반응하는 기업",
  "점유율 상승": "점유율을 넓혀 빠르게 성장하는 기업",
  "동물용 시장": "동물 관련 특화 시장에 집중하는 기업",
  "글로벌 임상": "해외 임상 수주로 성장 기회를 얻는 기업",
  특허·임상: "특허와 임상 결과가 중요한 기업",
  "그룹 확장": "그룹 성장과 함께 신사업을 넓히는 기업",
};

/**
 * 엑셀 파일에서 키워드별 기업 정보를 읽어옵니다.
 * @param keywords 선택된 키워드 배열 (최대 3개)
 * @param companiesPerKeyword 키워드당 추출할 기업 수 (기본값: 2)
 * @returns 키워드별 기업 정보 배열
 */
export function readCompaniesByKeywords(
  keywords: string[],
  companiesPerKeyword = 2,
): KeywordSection[] {
  try {
    const filePath = join(
      process.cwd(),
      "data",
      "keyword_matched_companies.xlsx",
    );
    const file = readFileSync(filePath);
    const workbook = XLSX.read(file, { type: "buffer" });

    const result: KeywordSection[] = [];

    for (const keyword of keywords.slice(0, 3)) {
      // 시트 이름 확인
      const sheetName = workbook.SheetNames.find(
        (name) => name === keyword || name.includes(keyword),
      );

      if (!sheetName) {
        console.warn(`시트를 찾을 수 없습니다: ${keyword}`);
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
      });

      if (data.length < 2) {
        continue; // 헤더만 있거나 데이터가 없음
      }

      // 헤더 추출 (첫 번째 행)
      const headers = data[0] as string[];
      const nameIndex = headers.findIndex(
        (h) => h?.includes("기업명") || h?.includes("name"),
      );
      const summaryIndex = headers.findIndex(
        (h) => h?.includes("한 줄 요약") || h?.includes("summary"),
      );
      const tagIndex = headers.findIndex(
        (h) =>
          h?.includes("오산업 분류력") ||
          h?.includes("상품") ||
          h?.includes("tag"),
      );
      const descIndex = headers.findIndex(
        (h) =>
          h?.includes("추가설명") ||
          h?.includes("description") ||
          h?.includes("설명"),
      );

      // 데이터 행 처리
      const companies: Company[] = [];
      const seenNames = new Set<string>();

      for (let i = 1; i < data.length; i++) {
        const row = data[i] as unknown[];

        if (!row || row.length === 0) continue;

        const name = row[nameIndex]?.toString().trim();
        if (!name || seenNames.has(name)) continue;

        const summary = row[summaryIndex]?.toString().trim() || "";
        const tag = row[tagIndex]?.toString().trim() || summary || "";
        const description = row[descIndex]?.toString().trim() || "";

        // 키워드 관련도 계산 (요약과 설명에서 키워드 빈도)
        const relevance = calculateRelevance(keyword, summary, description);

        companies.push({
          name,
          tag: tag || summary || "바이오",
          summary,
          description,
          relevance,
        });

        seenNames.add(name);
      }

      // 관련도 기준으로 정렬하고 상위 N개만 선택
      companies.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      const selectedCompanies = companies
        .slice(0, companiesPerKeyword)
        .map(({ relevance, ...rest }) => ({
          ...rest,
          // 가격 정보는 임시로 랜덤 생성 (실제 데이터가 있으면 사용)
          price: generateMockPrice(),
          change: generateMockChange(),
        }));

      result.push({
        keyword,
        desc: KEYWORD_DESCRIPTIONS[keyword] || `${keyword} 관련 기업`,
        companies: selectedCompanies,
      });
    }

    return result;
  } catch (error) {
    console.error("엑셀 파일 읽기 오류:", error);
    return [];
  }
}

/**
 * 키워드 관련도 계산 (요약과 설명에서 키워드 빈도)
 */
function calculateRelevance(
  keyword: string,
  summary: string,
  description: string,
): number {
  const text = `${summary} ${description}`.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // 키워드가 직접 포함된 경우 높은 점수
  if (text.includes(keywordLower)) {
    return 10;
  }

  // 키워드의 일부가 포함된 경우
  const keywordParts = keywordLower.split(/\s+/);
  let score = 0;
  for (const part of keywordParts) {
    if (part.length > 1 && text.includes(part)) {
      score += 2;
    }
  }

  return score;
}

/**
 * 임시 가격 생성 (실제 데이터가 있으면 제거)
 */
function generateMockPrice(): string {
  const prices = [
    "1,068,000원",
    "323,000원",
    "148,200원",
    "37,000원",
    "93,800원",
    "187,200원",
    "808,000원",
    "72,100원",
  ];
  return prices[Math.floor(Math.random() * prices.length)];
}

/**
 * 임시 변동률 생성 (실제 데이터가 있으면 제거)
 */
function generateMockChange(): string {
  const changes = [
    "-1.8%",
    "+0.9%",
    "+1.2%",
    "+0.3%",
    "-0.6%",
    "+2.1%",
    "+0.4%",
    "-1.3%",
  ];
  return changes[Math.floor(Math.random() * changes.length)];
}
