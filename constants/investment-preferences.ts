export interface InvestmentOption {
  code: number;
  keyword: string;
  description: string;
  highlight?: string;
}

export const INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    code: 1,
    keyword: "신약 개발",
    description: "임상 데이터와 파이프라인 모멘텀으로 고성장을 노리는 기업",
    highlight: "임상 단계별 기대치에 민감해요",
  },
  {
    code: 2,
    keyword: "제약 매출 안정",
    description: "꾸준한 처방·제네릭 매출로 방어력을 갖춘 제약사",
    highlight: "실적 기반의 완만한 성장을 선호해요",
  },
  {
    code: 3,
    keyword: "CDMO 생산",
    description: "위탁생산 CAPA와 수주 파이프라인이 핵심인 기업",
    highlight: "중장기 수주와 설비 확장을 중시해요",
  },
  {
    code: 4,
    keyword: "플랫폼 기술",
    description: "원천기술·플랫폼 검증으로 가치가 재평가되는 기업",
    highlight: "기술 트리거와 라이선스 아웃을 노려요",
  },
  {
    code: 5,
    keyword: "진단 모멘텀",
    description: "진단·이벤트성 수요로 단기 실적이 출렁이는 기업",
    highlight: "테마와 뉴스 흐름을 빠르게 캐치해요",
  },
  {
    code: 6,
    keyword: "의료기기",
    description: "기기 판매·인허가 확장으로 안정적 매출을 만드는 기업",
    highlight: "CAPEX·인증 로드맵을 꼼꼼히 봐요",
  },
  {
    code: 7,
    keyword: "동물 헬스케어",
    description: "동물의약·펫케어 니치 시장을 공략하는 기업",
    highlight: "사람과 다른 수요 사이클을 활용해요",
  },
  {
    code: 8,
    keyword: "글로벌 CRO",
    description: "해외 임상·수주 기반으로 성장하는 서비스 기업",
    highlight: "프로젝트 파이프라인과 수주 편차를 관리해요",
  },
  {
    code: 9,
    keyword: "웰니스 & 특허",
    description: "기능성 식품·웰니스 소재로 확장성을 노리는 기업",
    highlight: "특허·브랜드 확장을 중요하게 봐요",
  },
  {
    code: 10,
    keyword: "지주/그룹 안정",
    description: "지주·홀딩스 구조로 포트폴리오 리스크를 낮추는 기업",
    highlight: "그룹 시너지와 하방 안정성을 중시해요",
  },
];

const keywordMap = new Map(INVESTMENT_OPTIONS.map((opt) => [opt.keyword, opt]));
const codeMap = new Map(INVESTMENT_OPTIONS.map((opt) => [opt.code, opt]));

export function getInvestmentOption(keyword: string) {
  return keywordMap.get(keyword);
}

export function getInvestmentOptionByCode(code: number) {
  return codeMap.get(code);
}

export function getCodeByKeyword(keyword: string) {
  return keywordMap.get(keyword)?.code;
}

export function getKeywordByCode(code: number) {
  return codeMap.get(code)?.keyword;
}
