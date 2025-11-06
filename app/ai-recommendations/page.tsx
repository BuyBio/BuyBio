import Link from "next/link";

import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/ui/header";

export default function AIRecommendationsPage() {
  // 섹션용 임시 목데이터
  const persona = {
    summary: "성장과 기회를 보되, 과도한 변동은 줄이는 성향",
    strength: "고성장 구간을 빠르게 포착해요",
    caution: "이벤트성 급등·급락에 흔들릴 수 있어요",
  };

  type Stock = {
    name: string;
    code: string;
    price: number;
    changePct: number;
    category: string;
  };

  const sections: Array<{ title: string; subtitle: string; items: Stock[] }> = [
    {
      title: "신약 개발",
      subtitle: "신약 개발 성과를 바탕으로 성장을 노리는 기업",
      items: [
        {
          name: "셀트리온",
          code: "068270",
          price: 1068000,
          changePct: -1.8,
          category: "항체신약",
        },
        {
          name: "한미약품",
          code: "128940",
          price: 323000,
          changePct: 0.9,
          category: "혁신신약",
        },
      ],
    },
    {
      title: "점유율 상승",
      subtitle: "점유율을 넓혀 빠르게 성장하는 기업",
      items: [
        {
          name: "삼성바이오로직스",
          code: "207940",
          price: 1068000,
          changePct: -1.8,
          category: "CDMO",
        },
        {
          name: "오스템임플란트",
          code: "048260",
          price: 148200,
          changePct: 1.2,
          category: "의료기기",
        },
      ],
    },
    {
      title: "글로벌 임상",
      subtitle: "해외 임상 수주로 성장 기회를 얻는 기업",
      items: [
        {
          name: "HK이노엔",
          code: "195940",
          price: 37000,
          changePct: 0.3,
          category: "임상",
        },
        {
          name: "종근당",
          code: "185750",
          price: 93800,
          changePct: -0.6,
          category: "제약",
        },
      ],
    },
  ];

  const columns = [
    {
      title: "2024년 바이오 투자 전망과 핵심 종목",
      excerpt: "올해 바이오 섹터의 주요 이슈와 투자 포인트를 분석합니다.",
      meta: "2시간 전 • 바이오 전문가",
    },
    {
      title: "CDMO 업황 체크 — 수주/가동률/마진",
      excerpt: "현 상황에서 봐야 할 체크포인트를 정리했습니다.",
      meta: "5시간 전 • 산업 리서치",
    },
    {
      title: "임상 단계별 투자 위험/보상 구조",
      excerpt: "1상~3상 구간에서의 확률과 리스크를 숫자로 설명.",
      meta: "어제 • 퀀트 리서치",
    },
    {
      title: "환율/금리와 바이오 섹터 상관 관계",
      excerpt: "매크로 변수 변화가 섹터 입찰에 주는 영향.",
      meta: "2일 전 • 매크로",
    },
  ];
  return (
    <MobileLayout
      header={
        <Header>
          <Header.Left>
            <Link href="/">
              <Header.Title>BUYO</Header.Title>
            </Link>
          </Header.Left>
          <Header.Right>
            <Header.MenuButton />
          </Header.Right>
        </Header>
      }
    >
      <div className="flex flex-col gap-8 p-4">
        {/* 성향 요약 카드 */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-[12px] text-[#5B5F61]">나의 투자 성향</div>
            <div className="mt-1 text-[13px] text-blue-600">
              신약 개발 · 점유율 상승 · 시장 이벤트
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[14px] font-semibold text-[#9BBE18]">
                  요약
                </span>
                <span className="text-[14px] text-[#5B5F61]">
                  {persona.summary}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[14px] font-semibold text-[#9BBE18]">
                  강점
                </span>
                <span className="text-[14px] text-[#5B5F61]">
                  {persona.strength}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[14px] font-semibold text-[#9BBE18]">
                  주의
                </span>
                <span className="text-[14px] text-[#5B5F61]">
                  {persona.caution}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-[28px] text-[#9FA4A6]"
              >
                다시 진단하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 맞춤 종목 추천 타이틀 */}
        <div>
          <h2 className="text-[18px] font-semibold text-[#000]">
            맞춤 종목 추천
          </h2>
          <p className="mt-1 text-[14px] text-[#5B5F61]">
            선택하신 투자 성향별로 기업을 모았어요
          </p>
        </div>

        {/* 맞춤 종목 추천 섹션들 */}
        <div className="space-y-5">
          {sections.map((sec) => (
            <Card key={sec.title} className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#222]">
                      {sec.title}
                    </h3>
                    <p className="text-[14px] text-[#9FA4A6]">{sec.subtitle}</p>
                  </div>
                  <button type="button" className="text-[14px] text-[#5B5F61]">
                    전체 보기
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pr-1">
                  {sec.items.map((it) => (
                    <div
                      key={it.code}
                      className="min-w-[199px] rounded-[14px] border border-[#EEF0F2] bg-[#EEF1F6] p-[12px]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="rounded-[14px] bg-[#C6E941] px-[10px] py-[4px] text-[12px] font-medium text-[#222]">
                          {it.category}
                        </div>
                        <div className="text-[12px] text-[#9FA4A6]">
                          {it.code}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-300" />
                        <div className="flex-1">
                          <div className="text-[14px] font-semibold tracking-[-0.02em] text-[#222]">
                            {it.name}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[14px]">
                            <span className="text-[#5B5F61]">
                              {it.price.toLocaleString()}원
                            </span>
                            <span
                              className={
                                it.changePct >= 0
                                  ? "text-green-600 text-[12px]"
                                  : "text-[#2A71EA] text-[12px]"
                              }
                            >
                              {it.changePct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 맞춤 기술 칼럼 */}
        <div>
          <h2 className="text-[18px] font-semibold text-[#000]">
            맞춤 기술 칼럼
          </h2>
          <p className="mt-1 text-[14px] text-[#5B5F61]">
            선택하신 투자 성향별로 기업을 모았어요
          </p>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            {columns.map((c) => (
              <div key={c.title} className="rounded-[14px] bg-white">
                <div className="text-[14px] font-semibold text-[#000]">
                  {c.title}
                </div>
                <div className="mt-1 text-[13px] text-[#5B5F61]">
                  {c.excerpt}
                </div>
                <div className="mt-1 text-[12px] text-[#A0A0A0]">{c.meta}</div>
                <div className="mt-3 h-px w-full bg-[#EEF0F2]" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
