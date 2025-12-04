"use client";

import { useMemo } from "react";

import { useStockRealtime } from "@/hooks/useStockRealtime";
import type { StockRealtimeMessage } from "@/lib/stock-realtime-client";
import { cn } from "@/lib/utils";

const priceFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function extractNumber(
  payload: StockRealtimeMessage | null,
  keys: string[],
): number | null {
  if (!payload) return null;
  for (const key of keys) {
    const parsed = toNumber(payload[key]);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
}

interface StockTickerCardProps {
  symbol: string;
  label: string;
}

export function StockTickerCard({ symbol, label }: StockTickerCardProps) {
  const { data, connectionState, error } = useStockRealtime(symbol);

  const price = useMemo(
    () =>
      extractNumber(data, [
        "price",
        "tradePrice",
        "stck_prpr",
        "stckPrpr",
        "currentPrice",
      ]),
    [data],
  );

  const change = useMemo(
    () => extractNumber(data, ["change", "signedChangePrice", "prdy_vrss"]),
    [data],
  );

  const changeRate = useMemo(
    () => extractNumber(data, ["changeRate", "signedChangeRate", "prdy_ctrt"]),
    [data],
  );

  const direction = changeRate ?? change;
  const trendClass = direction
    ? direction > 0
      ? "text-emerald-600"
      : "text-rose-600"
    : "text-gray-500";

  const changeText = useMemo(() => {
    const parts: string[] = [];
    if (change !== null) {
      parts.push(`${change >= 0 ? "+" : ""}${formatNumber(change)}`);
    }
    if (changeRate !== null) {
      parts.push(`${changeRate >= 0 ? "+" : ""}${changeRate.toFixed(2)}%`);
    }
    if (parts.length === 0) {
      if (connectionState === "connecting") {
        return "연결 중";
      }
      return "데이터 대기";
    }
    return parts.join(" · ");
  }, [change, changeRate, connectionState]);

  const statusText = useMemo(() => {
    if (connectionState === "connecting") {
      return "실시간 서버 연결 중";
    }
    if (connectionState === "error") {
      const compactError = (error ?? "연결 오류").slice(0, 40);
      return `오류: ${compactError}`;
    }
    if (!data) {
      return "실시간 데이터 대기 중";
    }
    return "실시간 업데이트";
  }, [connectionState, data, error]);

  return (
    <div className="rounded-xl bg-white border p-3 shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
      <div className="text-[10px] text-gray-500 mb-0.5 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] uppercase text-gray-400">{symbol}</span>
      </div>
      <div className="text-lg font-semibold text-gray-900">
        {price !== null ? priceFormatter.format(price) : "—"}
      </div>
      <div className={cn("text-sm mt-0.5", trendClass)}>{changeText}</div>
      <div className="mt-2 text-[10px] text-gray-400">{statusText}</div>
    </div>
  );
}
