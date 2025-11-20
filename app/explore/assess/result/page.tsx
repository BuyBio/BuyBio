"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
import { getInvestmentOption } from "@/lib/constants/investment-preferences";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function AssessResultPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("buyo.assess.selected");
      if (raw) setSelected(JSON.parse(raw));
    } catch {
      setSelected([]);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || selected.length === 0) {
      return;
    }

    let aborted = false;
    const persist = async () => {
      setSaveState("saving");
      try {
        const response = await fetch("/api/investment-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selections: selected }),
        });

        if (!response.ok) {
          throw new Error("저장 실패");
        }

        if (!aborted) {
          setSaveState("saved");
          toast.success("투자 성향이 저장됐어요");
        }
      } catch (error) {
        console.error(error);
        if (!aborted) {
          setSaveState("error");
          toast.error("투자 성향을 저장하지 못했습니다. 다시 시도해주세요.");
        }
      }
    };

    persist();
    return () => {
      aborted = true;
    };
  }, [selected, status]);

  const descriptions = useMemo(() => {
    return selected
      .map((keyword) => {
        const option = getInvestmentOption(keyword);
        if (!option) {
          return null;
        }
        return option.description;
      })
      .filter(Boolean) as string[];
  }, [selected]);

  const isLoggedIn = status === "authenticated";

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
          <CardContent className="space-y-4">
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

            {descriptions.length > 0 && (
              <ul className="space-y-2 text-[13px] text-[#5B5F61]">
                {descriptions.map((desc) => (
                  <li key={desc} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#9BBE18]" />
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            )}

            {!isLoggedIn && (
              <p className="text-[13px] text-red-500">
                로그인 후에 결과를 저장할 수 있어요.{" "}
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/auth/signin?callbackUrl=/explore/assess/result",
                    )
                  }
                  className="font-semibold text-blue-600 underline"
                >
                  로그인하기
                </button>
              </p>
            )}

            {isLoggedIn && (
              <p className="text-[12px] text-[#9FA4A6]">
                {saveState === "saved"
                  ? "투자 성향이 내 계정에 저장되었습니다."
                  : saveState === "saving"
                    ? "저장 중입니다..."
                    : saveState === "error"
                      ? "저장을 다시 시도해주세요."
                      : "계정에 결과를 저장하고 있어요."}
              </p>
            )}

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
