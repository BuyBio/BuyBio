"use client";

import { useEffect, useState } from "react";

import {
  type ConnectionState,
  type StockRealtimeMessage,
  stockRealtimeService,
} from "@/lib/stock-realtime-client";

export interface UseStockRealtimeResult {
  data: StockRealtimeMessage | null;
  connectionState: ConnectionState;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export function useStockRealtime(
  symbol?: string | null,
): UseStockRealtimeResult {
  const [data, setData] = useState<StockRealtimeMessage | null>(null);
  const [connectionState, setConnectionState] = useState(
    stockRealtimeService.getState(),
  );
  const [error, setError] = useState<string | null>(
    stockRealtimeService.getLastError(),
  );

  const normalizedSymbol = symbol?.trim();

  useEffect(() => {
    return stockRealtimeService.onConnectionStateChange((state) => {
      setConnectionState(state);
      if (state === "error") {
        setError(stockRealtimeService.getLastError());
      } else if (state === "connected") {
        setError(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!normalizedSymbol) {
      setData(null);
      return;
    }

    const handler = (payload: StockRealtimeMessage) => {
      setData(payload);
    };

    const unsubscribe = stockRealtimeService.subscribe(
      normalizedSymbol,
      handler,
    );

    return () => {
      unsubscribe();
    };
  }, [normalizedSymbol]);

  return {
    data,
    connectionState,
    error,
    isConnected: connectionState === "connected",
    isConnecting: connectionState === "connecting",
  };
}
