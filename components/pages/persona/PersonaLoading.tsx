import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { Search } from "lucide-react";

interface PersonaLoadingProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  helperText?: string;
  actionLabel?: string;
}

/**
 * Shows an intentional loading state while the investment persona API runs.
 */
export function PersonaLoading({
  title = "투자 성향을 분석하고 있어요",
  description = "응답하신 투자 선호도를 바탕으로 맞춤형 프로필을 계산 중이에요.",
  actionLabel = "홈으로",

  className,
  ...props
}: PersonaLoadingProps) {
  const analysisHighlights = [
    "시장 변동성과 리스크 완충 구간을 확인 중이에요.",
    "관심 섹터별 투자 비중을 정교하게 분석하고 있어요.",
    "최근 매매 패턴과 목표 수익률을 매칭 중이에요.",
  ];

  return (
    <section
      {...props}
      className={cn(
        "flex flex-col h-full justify-center items-center gap-6 rounded-2xl border border-gray-100 bg-white p-6 text-center ",
        className,
      )}
    >
      <div className="relative">
        <div className="flex h-40 w-32 flex-col gap-3 rounded-[18px] border border-gray-100 bg-gray-50 px-4 py-5 shadow-inner">
          <div className="h-3 rounded-full bg-gray-200" />
          <div className="h-2.5 w-3/4 rounded-full bg-gray-100" />
          <div className="h-2.5 rounded-full bg-gray-100" />
          <div className="h-2 rounded-full bg-gray-100" />
          <div className="mt-auto h-10 rounded-xl bg-white shadow-xs" />
        </div>
        <div className="absolute -bottom-4 -right-4 flex size-16 items-center justify-center rounded-full border-4 border-primary-100 bg-white shadow-lg">
          <div className="absolute inset-1 rounded-full border-2 border-primary-200/70" />
          <div className="absolute inset-1 animate-spin rounded-full border-t-2 border-blue-300/80" />
          <Search className="relative z-10 size-6 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      </div>

      <div className="w-full rounded-2xl bg-primary-50/70 px-4 py-3 text-left text-sm text-primary-800">
        <p className="text-xs font-semibold tracking-tight text-primary-700">
          실시간 분석 항목
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-gray-500">
          {analysisHighlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-400" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
