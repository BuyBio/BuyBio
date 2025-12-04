"use client";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type StockRealtimeMessage = {
  symbol?: string;
  price?: number | string;
  tradePrice?: number | string;
  stck_prpr?: string;
  stckPrpr?: string;
  currentPrice?: number | string;
  change?: number | string;
  signedChangePrice?: number | string;
  prdy_vrss?: number | string;
  changeRate?: number | string;
  signedChangeRate?: number | string;
  prdy_ctrt?: number | string;
  timestamp?: string | number;
  [key: string]: unknown;
};

export type StockRealtimeHandler = (payload: StockRealtimeMessage) => void;
export type ConnectionState = "idle" | "connecting" | "connected" | "error";

interface SymbolSubscription {
  handlers: Set<StockRealtimeHandler>;
  stompSubscription?: StompSubscription;
}

const SOCKET_ENDPOINT = "http://3.26.94.208:8080/ws-stock";
const TOPIC_PREFIX = "/topic/stock";
const PUBLISH_DESTINATION = "/app/subscribe";

class StockRealtimeClient {
  private client?: Client;
  private subscriptions = new Map<string, SymbolSubscription>();
  private connectionState: ConnectionState = "idle";
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private lastError: string | null = null;
  private isCreatingClient = false;

  public subscribe(symbol: string, handler: StockRealtimeHandler): () => void {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    if (!normalizedSymbol) {
      throw new Error("구독할 종목 코드를 입력하세요.");
    }

    let record = this.subscriptions.get(normalizedSymbol);
    if (!record) {
      record = { handlers: new Set() };
      this.subscriptions.set(normalizedSymbol, record);
    }

    record.handlers.add(handler);
    this.ensureClient();

    if (this.client?.connected && !record.stompSubscription) {
      this.subscribeToSymbol(normalizedSymbol);
    }

    return () => {
      this.unsubscribe(normalizedSymbol, handler);
    };
  }

  public unsubscribe(symbol: string, handler: StockRealtimeHandler) {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    if (!normalizedSymbol) {
      return;
    }

    const record = this.subscriptions.get(normalizedSymbol);
    if (!record) {
      return;
    }

    record.handlers.delete(handler);

    if (record.handlers.size === 0) {
      this.publishSubscriptionAction(normalizedSymbol, "REMOVE");
      record.stompSubscription?.unsubscribe();
      this.subscriptions.delete(normalizedSymbol);
      this.teardownClientIfIdle();
    }
  }

  public getState(): ConnectionState {
    return this.connectionState;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  public onConnectionStateChange(listener: (state: ConnectionState) => void) {
    this.stateListeners.add(listener);
    listener(this.connectionState);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private ensureClient(): void {
    // 이미 클라이언트가 있고 활성화되어 있으면 재생성하지 않음
    if (this.client?.active) {
      return;
    }

    // 클라이언트가 있지만 비활성화된 경우, 재활성화만 시도
    if (this.client && !this.client.active) {
      if (this.subscriptions.size > 0) {
        this.client.activate();
      }
      return;
    }

    // 서버 사이드에서는 클라이언트 생성하지 않음
    if (typeof window === "undefined") {
      return;
    }

    // 이미 클라이언트 생성이 진행 중이면 무시 (동시 호출 방지)
    if (this.isCreatingClient) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[stock-ws] 클라이언트 생성이 이미 진행 중입니다.");
      }
      return;
    }

    // 새 클라이언트 생성 (이미 존재하는 클라이언트가 없을 때만)
    if (this.client) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[stock-ws] 클라이언트가 이미 존재하지만 활성화되지 않았습니다.",
        );
      }
      return;
    }

    // 클라이언트 생성 시작 (동시 호출 방지)
    this.isCreatingClient = true;

    if (process.env.NODE_ENV === "development") {
      console.info("[stock-ws] 새 웹소켓 클라이언트 생성 중...");
    }

    this.setState("connecting");

    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_ENDPOINT),
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (process.env.NODE_ENV === "development") {
          console.info("[stock-ws] 웹소켓 연결 성공");
        }
        this.isCreatingClient = false; // 생성 완료
        this.handleConnected();
      },
      debug: (message: string) => {
        if (process.env.NODE_ENV === "development") {
          console.info(`[stock-ws] ${message}`);
        }
      },
    });

    this.client.onStompError = (frame) => {
      const message = frame.body || frame.headers.message || "STOMP 오류";
      this.isCreatingClient = false; // 에러 발생 시 플래그 초기화
      this.setState("error", message);
    };

    this.client.onWebSocketClose = () => {
      if (process.env.NODE_ENV === "development") {
        console.info("[stock-ws] 웹소켓 연결 종료");
      }
      this.isCreatingClient = false; // 연결 종료 시 플래그 초기화
      if (this.subscriptions.size > 0) {
        this.setState("connecting");
      } else {
        this.setState("idle");
      }
    };

    this.client.onWebSocketError = (event) => {
      const message =
        typeof event === "string"
          ? event
          : (event?.toString?.() ?? "웹소켓 오류");
      this.isCreatingClient = false; // 에러 발생 시 플래그 초기화
      this.setState("error", message);
    };

    this.client.activate();
  }

  private handleConnected() {
    this.setState("connected");
    this.subscriptions.forEach((_, symbol) => {
      this.subscribeToSymbol(symbol);
    });
  }

  private subscribeToSymbol(symbol: string) {
    if (!this.client?.connected) {
      return;
    }

    const record = this.subscriptions.get(symbol);
    if (!record) {
      return;
    }

    record.stompSubscription?.unsubscribe();
    record.stompSubscription = this.client.subscribe(
      `${TOPIC_PREFIX}/${symbol}`,
      (message: IMessage) => {
        const payload = this.parseMessage(message, symbol);
        record?.handlers.forEach((handler) => {
          handler(payload);
        });
      },
    );

    this.publishSubscriptionAction(symbol, "ADD");
  }

  private publishSubscriptionAction(symbol: string, action: "ADD" | "REMOVE") {
    if (!this.client?.connected) {
      return;
    }

    this.client.publish({
      destination: PUBLISH_DESTINATION,
      body: JSON.stringify({ symbol, action }),
    });
  }

  private parseMessage(
    message: IMessage,
    symbol: string,
  ): StockRealtimeMessage {
    try {
      const data = JSON.parse(message.body);
      if (data && typeof data === "object") {
        return {
          symbol,
          ...data,
        } as StockRealtimeMessage;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("실시간 데이터 파싱 실패", error);
      }
    }

    return {
      symbol,
      raw: message.body,
    } as StockRealtimeMessage;
  }

  private teardownClientIfIdle() {
    if (this.client && this.subscriptions.size === 0) {
      const client = this.client;
      this.client = undefined;
      void client.deactivate();
      this.setState("idle");
    }
  }

  private normalizeSymbol(symbol: string): string {
    return symbol?.trim().toUpperCase();
  }

  private setState(state: ConnectionState, errorMessage?: string) {
    this.connectionState = state;
    this.lastError = errorMessage ?? null;
    this.stateListeners.forEach((listener) => {
      listener(state);
    });
  }
}

export const stockRealtimeService = new StockRealtimeClient();
