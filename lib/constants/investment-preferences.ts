export interface InvestmentOption {
  keyword: string;
  description: string;
  highlight?: string;
}

export const INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    keyword: "신약 개발",
    description: "신약 개발 성과를 바탕으로 성장을 노리는 기업",
    highlight: "임상 단계별 모멘텀에 민감해요",
  },
  {
    keyword: "안정 성장",
    description: "안정적인 매출을 기반으로 꾸준히 크는 기업",
    highlight: "장기 우상향을 선호해요",
  },
  {
    keyword: "위탁생산",
    description: "생산을 맡아 안정적으로 확장하는 기업",
    highlight: "현금 흐름과 수주를 중시해요",
  },
  {
    keyword: "원천기술",
    description: "기술 가치에 따라 단기 움직임이 큰 기업",
    highlight: "기술력 대비 저평가를 찾습니다",
  },
  {
    keyword: "시장 이벤트",
    description: "시장 이슈와 이벤트에 빠르게 반응하는 기업",
    highlight: "뉴스·테마 흐름을 빠르게 따라요",
  },
  {
    keyword: "점유율 상승",
    description: "점유율을 넓혀 빠르게 성장하는 기업",
    highlight: "성장률과 경쟁 구도를 살펴요",
  },
  {
    keyword: "동물용 시장",
    description: "동물 관련 특화 시장에 집중하는 기업",
    highlight: "니치 시장의 기회를 노려요",
  },
  {
    keyword: "글로벌 임상",
    description: "해외 임상 수주로 성장 기회를 얻는 기업",
    highlight: "국제 협업과 파이프라인을 봐요",
  },
  {
    keyword: "특허·임상",
    description: "특허와 임상 결과가 중요한 기업",
    highlight: "연구 개발의 질을 점검해요",
  },
  {
    keyword: "그룹 확장",
    description: "그룹 성장과 함께 신사업을 넓히는 기업",
    highlight: "계열 시너지와 밸류체인을 중시해요",
  },
];

export function getInvestmentOption(keyword: string) {
  return INVESTMENT_OPTIONS.find((opt) => opt.keyword === keyword);
}
