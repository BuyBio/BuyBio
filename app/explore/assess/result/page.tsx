"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/ui/header";

export default function AssessResultPage() {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("buyo.assess.selected");
      if (raw) setSelected(JSON.parse(raw));
    } catch {}
  }, []);

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
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-[18px]">결과가 준비되었어요</CardTitle>
            <CardDescription className="text-[14px]">
              선택하신 성향을 바탕으로 맞춤 추천을 구성했어요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-[#C6E941] px-3 py-1 text-[12px] font-medium text-[#222]"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/ai-recommendations" className="contents">
                <Button className="w-full">AI 추천 보러가기</Button>
              </Link>
              <Link href="/briefing" className="contents">
                <Button variant="outline" className="w-full">
                  브리핑 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
