"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

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
import { getInvestmentOption } from "@/constants/investment-preferences";
import { useInvestmentProfileQuery } from "@/hooks/useInvestmentProfile";

import dayjs from "dayjs";
import { match, P } from "ts-pattern";

export default function AssessResultPage() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useInvestmentProfileQuery();

  const selected = profile?.selections ?? [];

  const descriptions = useMemo(() => {
    return selected
      .map((keyword) =>
        match(getInvestmentOption(keyword))
          .with({ description: P.select() }, (description) => description)
          .otherwise(() => null),
      )
      .filter((desc): desc is string => Boolean(desc));
  }, [selected]);

  const loadError = Boolean(error);
  const hasSelections = selected.length > 0;
  const lastUpdated = dayjs(profile?.updatedAt).format("YYYY-MM-DD");

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
      <div className="flex flex-col h-full justify-center gap-6 p-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-[18px]">결과가 준비되었어요</CardTitle>
            <CardDescription className="text-[14px]">
              선택하신 성향을 바탕으로 맞춤 추천을 구성했어요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="space-y-6 animate-pulse">
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2].map((idx) => (
                    <span
                      key={idx}
                      className="h-6 w-20 rounded-full bg-gray-200"
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="h-4 w-full rounded bg-gray-100" />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !loadError && !hasSelections && (
              <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-[13px] text-gray-500">
                <p>아직 저장된 투자 성향 결과가 없어요.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/persona")}
                >
                  성향 진단하러 가기
                </Button>
              </div>
            )}

            {!isLoading && !loadError && hasSelections && (
              <>
                <div className="flex flex-wrap gap-2">
                  {selected.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-primary px-3 py-1 text-[12px] font-medium text-[#222]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                {descriptions.length > 0 && (
                  <ul className="space-y-2 text-[13px] text-gray-500">
                    {descriptions.map((desc) => (
                      <li key={desc} className="flex items-center gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-[12px] text-gray-500">
                  {lastUpdated
                    ? `마지막 업데이트: ${lastUpdated}`
                    : "투자 성향 정보가 저장되어 있어요."}
                </p>
              </>
            )}

            <div className="grid">
              <Link href="/ai-recommendations" className="contents">
                <Button
                  variant={"link"}
                  className="w-full text-black bg-primary"
                >
                  AI 추천 보러가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
