import Link from "next/link";

import { MobileLayout } from "@/components/layout/mobile-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/ui/header";

export default function BriefingPage() {
  // 임시 목데이터
  const hotNewsItems = [
    {
      title: "국내 제약사, 글로벌 3상 임박으로 관심 집중",
      source: "연합",
      time: "3분 전",
    },
    {
      title: "혁신의료기기 지정 확대… 바이오주 강세",
      source: "머니",
      time: "12분 전",
    },
    {
      title: "바이오 ETF, 4거래일 연속 순유입 기록",
      source: "헤럴드",
      time: "35분 전",
    },
    {
      title: "항암 신약 후보, 초기 임상서 유의미한 반응",
      source: "이데일리",
      time: "1시간 전",
    },
  ];

  const videoItems = [
    {
      title: "임상 단계 한눈에 정리 — 투자 포인트 3가지",
      duration: "08:21",
    },
    {
      title: "바이오 섹터 사이클, 지금은 어디?",
      duration: "12:05",
    },
    {
      title: "신약 파이프라인 리딩 방법(초심자용)",
      duration: "09:47",
    },
  ];

  const columnItems = [
    {
      title: "ADC 기술 트렌드와 주요 기업 비교",
      excerpt: "표적 전달 효율을 끌어올리는 핵심 파라미터를 짚어봅니다.",
    },
    {
      title: "CDMO 산업 구조와 수익 레버리지",
      excerpt: "설비 가동률과 마진의 상관관계를 간단한 예시로 설명합니다.",
    },
    {
      title: "규제 변화가 임상 일정에 미치는 영향",
      excerpt: "승인 지연/가속 사례를 통해 리스크 관리 포인트 정리.",
    },
    {
      title: "바이오 밸류에이션 체크리스트",
      excerpt: "현금 소진률, 파이프라인 단계, 파트너십 등 핵심 항목.",
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
      <div className="flex flex-col gap-6 p-4">
        {/* 1) 실시간 주요 지수 — 이전 스타일 복원 */}
        <Card className="bg-gradient-to-b from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">실시간 주요 지수</CardTitle>
            <CardDescription>
              바이오 산업과 연관된 주요 지수를 모았어요
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white border p-3">
                <div className="text-xs text-gray-500 mb-1">코스피</div>
                <div className="text-lg font-semibold">2,450.25</div>
                <div className="text-sm text-green-600">+1.20%</div>
              </div>
              <div className="rounded-xl bg-white border p-3">
                <div className="text-xs text-gray-500 mb-1">코스닥</div>
                <div className="text-lg font-semibold">789.10</div>
                <div className="text-sm text-red-600">-0.50%</div>
              </div>
              <div className="rounded-xl bg-white border p-3">
                <div className="text-xs text-gray-500 mb-1">원/달러</div>
                <div className="text-lg font-semibold">1,345.2</div>
                <div className="text-sm text-green-600">-0.34%</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge className="rounded-full">바이오</Badge>
              <Badge variant="secondary" className="rounded-full">
                반도체
              </Badge>
              <Badge variant="outline" className="rounded-full">
                2차전지
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 2) 지금 뜨는 바이오 소식 — 텍스트 목데이터 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">지금 뜨는 바이오 소식</CardTitle>
            <CardDescription>
              바이오 산업에 영향을 줄 기사만 모았어요
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 grid grid-cols-2 gap-3">
            {hotNewsItems.map((n) => (
              <div key={n.title} className="rounded-xl border p-3">
                <p className="text-sm font-medium line-clamp-2">{n.title}</p>
                <div className="mt-1 text-[11px] text-gray-500">
                  {n.source} · {n.time}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3) BUYO 투자 이야기 — 영상 목데이터 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">BUYO 투자 이야기</CardTitle>
            <CardDescription>
              전문가가 쉽게 풀어낸 내용을 영상으로 확인해요
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 grid grid-cols-3 gap-3">
            {videoItems.map((v) => (
              <div key={v.title} className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-black/70 text-white flex items-center justify-center">
                      ▶
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium line-clamp-2">{v.title}</p>
                <p className="text-[11px] text-gray-500">{v.duration}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 4) 기술 칼럼 — 텍스트 목데이터 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">기술 칼럼</CardTitle>
            <CardDescription>
              복잡한 바이오 기술과 산업 이슈도 쉽게 풀어드려요
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            {columnItems.map((c) => (
              <div key={c.title} className="rounded-xl border p-3">
                <p className="text-sm font-medium">{c.title}</p>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {c.excerpt}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
