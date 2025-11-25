"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import { PersonaLoading } from "@/components/pages/persona/PersonaLoading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/ui/header";
import { Progress } from "@/components/ui/progress";
import { useSaveInvestmentProfileMutation } from "@/hooks/useInvestmentProfile";
import { INVESTMENT_OPTIONS } from "@/lib/constants/investment-preferences";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

export default function AssessPersonaPage() {
  const router = useRouter();
  const [selectedKeyword, setSelectKeyword] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isCanPickMore = selectedKeyword.length < 3;
  const isSelectKeyword = (keyword: string) =>
    selectedKeyword.includes(keyword);

  const { mutateAsync, isPending } = useSaveInvestmentProfileMutation();

  const handleToggle = (keyword: string) => {
    if (!isSelectKeyword(keyword) && !isCanPickMore) return;

    if (isSelectKeyword(keyword)) {
      return setSelectKeyword((prev) => prev.filter((v) => v !== keyword));
    }

    setSelectKeyword((prev) => [...prev, keyword]);
  };

  const handleSubmit = async () => {
    try {
      setIsAnalyzing(true);
      await mutateAsync(selectedKeyword);
      toast.success("분석 성공했습니다.");
      router.replace("/persona/complete");
    } catch {
      toast.error("분석을 실패했습니다.");
      setIsAnalyzing(false);
    }
  };

  return (
    <MobileLayout
      className="relative"
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
      {isAnalyzing ? (
        <PersonaLoading />
      ) : (
        <>
          <div className="flex flex-col p-4">
            <div className="mx-auto max-w-[420px] flex flex-col gap-4">
              {/* 진행바 */}
              <div className="sticky top-4 flex gap-3 items-center bg-white/50">
                <Progress
                  value={Math.floor(selectedKeyword.length * 33)}
                  className="rounded-full bg-gray-200 h-1"
                />
                <span className="font-semibold text-gray-400 text-sm text-nowrap">
                  {selectedKeyword.length}/3 선택
                </span>
              </div>

              {/* 타이틀 */}
              <div className="flex flex-col justify-center items-center">
                <h1 className="text-[22px] font-bold tracking-[-0.3px]">
                  평소에 어떻게 투자하시나요?
                </h1>
                <span className="text-gray-400 font-semibold text-sm">
                  투자 스타일을 세 가지 골라주세요
                </span>
              </div>

              {/* 카드형 선택 버튼 */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {INVESTMENT_OPTIONS.map((opt) => {
                  const active = isSelectKeyword(opt.keyword);
                  const disabled = !active && !isCanPickMore;
                  const cardClasses = cn(
                    "h-[96px] cursor-pointer rounded-[16px] border transition-all",
                    active
                      ? "border-blue-500 bg-blue-50"
                      : "bg-gray-50 hover:bg-gray-100 shadow-md",
                    disabled ? "cursor-not-allowed opacity-50" : "",
                  );

                  return (
                    <Card
                      key={opt.keyword}
                      tabIndex={disabled ? -1 : 0}
                      aria-pressed={active}
                      aria-disabled={disabled}
                      onClick={() => handleToggle(opt.keyword)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleToggle(opt.keyword);
                        }
                      }}
                      className={cardClasses}
                    >
                      <CardContent className="flex h-full flex-col justify-center gap-1 p-4 text-left">
                        <span className="text-xs font-medium text-blue-500">
                          {opt.keyword}
                        </span>
                        <span className="text-sm font-semibold leading-5 text-[#2B2F33]">
                          {opt.description}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
          {/* 하단 버튼 */}
          <div className="sticky bottom-[10px] flex flex-col px-4 gap-3">
            <Button
              variant={"outline"}
              className="bg-gray-100 !disabled:bg-gray-200 !disabled:cursor-not-allowed"
              disabled={isCanPickMore}
              onClick={handleSubmit}
            >
              {isCanPickMore ? (
                <div className="flex w-full justify-center gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            selectedKeyword.length > idx
                              ? "bg-primary"
                              : "bg-gray-300",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-normal">
                    {selectedKeyword.length}개 남았어요.
                  </span>
                </div>
              ) : (
                <span>분석하기</span>
              )}
            </Button>
            <Button
              className="p-4"
              variant="outline"
              onClick={() => setSelectKeyword([])}
            >
              건너뛰기
            </Button>
          </div>
        </>
      )}
    </MobileLayout>
  );
}
