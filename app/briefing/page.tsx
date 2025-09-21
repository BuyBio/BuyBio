"use client";

import Link from "next/link";

import { MobileLayout } from "@/components/layout/mobile-layout";
import Header from "@/components/ui/header";

export default function BriefingPage() {
  const handleMenu = () => {
    alert("메뉴를 열었습니다!");
  };

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
            <Header.MenuButton onClick={handleMenu} />
          </Header.Right>
        </Header>
      }
    >
      <div className="flex flex-col p-4">
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">오늘의 시장 동향</h2>
            <p className="text-gray-600">코스피 2,450.25 (+1.2%)</p>
            <p className="text-gray-600">코스닥 789.10 (-0.5%)</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">주요 뉴스</h2>
            <p className="text-gray-600">• 반도체 섹터 강세 지속</p>
            <p className="text-gray-600">• 바이오 관련주 상승세</p>
            <p className="text-gray-600">• 금리 인하 기대감 확산</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
