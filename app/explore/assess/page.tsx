"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";

const OPTIONS: Array<{ keyword: string; description: string }> = [
  {
    keyword: "신약 개발",
    description: "신약 개발 성과를 바탕으로 성장을 노리는 기업",
  },
  {
    keyword: "안정 성장",
    description: "안정적인 매출을 기반으로 꾸준히 크는 기업",
  },
  {
    keyword: "위탁생산",
    description: "생산을 맡아 안정적으로 확장하는 기업",
  },
  {
    keyword: "원천기술",
    description: "기술 가치에 따라 단기 움직임이 큰 기업",
  },
  {
    keyword: "시장 이벤트",
    description: "시장 이슈와 이벤트에 빠르게 반응하는 기업",
  },
  {
    keyword: "점유율 상승",
    description: "점유율을 넓혀 빠르게 성장하는 기업",
  },
  {
    keyword: "동물용 시장",
    description: "동물 관련 특화 시장에 집중하는 기업",
  },
  {
    keyword: "글로벌 임상",
    description: "해외 임상 수주로 성장 기회를 얻는 기업",
  },
  {
    keyword: "특허·임상",
    description: "특허와 임상 결과가 중요한 기업",
  },
  {
    keyword: "그룹 확장",
    description: "그룹 성장과 함께 신사업을 넓히는 기업",
  },
];

export default function AssessPersonaPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const canPickMore = selected.length < 3;
  const isSelected = (keyword: string) => selected.includes(keyword);

  const toggle = (keyword: string) => {
    setSelected((prev) => {
      const exists = prev.includes(keyword);
      if (exists) return prev.filter((v) => v !== keyword);
      if (prev.length >= 3) return prev; // guard
      return [...prev, keyword];
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
                const active = isSelected(opt.keyword);
                const disabled = !active && !canPickMore;
                return (
                  <button
                    key={opt.keyword}
                    type="button"
                    onClick={() => toggle(opt.keyword)}
                    disabled={disabled}
                    className={[
                      "flex h-[96px] items-center gap-3 rounded-[16px] border p-4 text-left transition-all",
                      active
                        ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                        : "border-[#EEF0F2] bg-[#F4F7FB] hover:bg-[#EFF3F9]",
                      disabled ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    <div className="flex h-full flex-col justify-center">
                      <span className="text-[12px] font-medium text-blue-500">
                        {opt.keyword}
                      </span>
                      <span className="mt-1 text-[14px] font-semibold leading-5 text-[#2B2F33]">
                        {opt.description}
                      </span>
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
