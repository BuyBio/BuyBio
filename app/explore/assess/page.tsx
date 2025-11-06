"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";

const OPTIONS = [
  "신약 개발",
  "점유율 상승",
  "시장 이벤트",
  "CDMO",
  "의료기기",
  "글로벌 임상",
  "바이오시밀러",
  "플랫폼 기술",
  "해외 수출",
  "퀀트 신호",
] as const;

export default function AssessPersonaPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const canPickMore = selected.length < 3;
  const isSelected = (opt: string) => selected.includes(opt);

  const toggle = (opt: string) => {
    setSelected((prev) => {
      const exists = prev.includes(opt);
      if (exists) return prev.filter((v) => v !== opt);
      if (prev.length >= 3) return prev; // guard
      return [...prev, opt];
    });
  };

  const subtitle = useMemo(() => {
    if (selected.length === 0) return "투자 스타일을 세 가지 골라주세요";
    if (selected.length < 3) return `${3 - selected.length}개 남았어요`;
    return "3개 선택 완료";
  }, [selected.length]);

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
      <div className="flex max-h-[100dvh] min-h-[100dvh] flex-col p-4">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[420px]">
            {/* 진행바 */}
            <div className="mt-2 flex items-center gap-2 px-1">
              <div className="h-1.5 w-full rounded bg-[#EEF0F2]">
                <div
                  className="h-1.5 rounded bg-blue-500"
                  style={{ width: `${(selected.length / 3) * 100}%` }}
                />
              </div>
              <span className="text-[12px] text-[#9FA4A6]">
                {selected.length}/3 선택
              </span>
            </div>

            {/* 타이틀 */}
            <div className="mt-4 px-1">
              <h1 className="text-[22px] font-bold tracking-[-0.3px]">
                평소에 어떻게 투자하시나요?
              </h1>
              <p className="mt-1 text-[13px] text-[#9FA4A6]">{subtitle}</p>
            </div>

            {/* 카드형 선택 버튼 */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {OPTIONS.map((opt) => {
                const active = isSelected(opt);
                const disabled = !active && !canPickMore;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    disabled={disabled}
                    className={[
                      "flex h-[96px] items-center gap-3 rounded-[16px] border p-4 text-left transition-all",
                      active
                        ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                        : "border-[#EEF0F2] bg-[#F4F7FB] hover:bg-[#EFF3F9]",
                      disabled ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[18px] text-blue-500">
                      •
                    </div>
                    <div className="text-[14px] font-semibold leading-5 text-[#2B2F33]">
                      {opt}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 남은 개수 인디케이터 */}
            <div className="my-6 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-[#F4F7FB] px-4 py-2 text-[14px] text-[#5B5F61]">
                <span
                  className={`h-2 w-2 rounded-full ${selected.length >= 1 ? "bg-blue-500" : "bg-[#D5D9DE]"}`}
                />
                <span
                  className={`h-2 w-2 rounded-full ${selected.length >= 2 ? "bg-blue-500" : "bg-[#D5D9DE]"}`}
                />
                <span
                  className={`h-2 w-2 rounded-full ${selected.length >= 3 ? "bg-blue-500" : "bg-[#D5D9DE]"}`}
                />
                <span className="ml-2">{subtitle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 mt-2 grid grid-cols-2 gap-2 bg-white pb-2 pt-1">
          <Button variant="outline" onClick={() => setSelected([])}>
            건너뛰기
          </Button>
          <Button
            disabled={selected.length !== 3}
            onClick={() => {
              try {
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "buyo.assess.selected",
                    JSON.stringify(selected),
                  );
                }
              } catch {}
              router.push("/explore/assess/result");
            }}
          >
            다음으로
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
