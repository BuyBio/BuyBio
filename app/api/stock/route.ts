import { NextResponse } from "next/server";

import {
  getStockDailyData,
  getStockOrderbook,
  getStockPrice,
} from "@/lib/kis-api";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    // 1. 유저 인증 확인
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 },
      );
    }

    // 2. 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const action = searchParams.get("action") || "price";

    if (!code) {
      return NextResponse.json(
        { error: "종목코드가 필요합니다." },
        { status: 400 },
      );
    }

    // 3. 액션에 따른 데이터 조회
    switch (action) {
      case "price": {
        const priceData = await getStockPrice(code);
        return NextResponse.json({
          success: true,
          data: {
            code,
            currentPrice: parseFloat(priceData.stck_prpr),
            priceChange: parseFloat(priceData.prdy_vrss),
            priceChangeRate: parseFloat(priceData.prdy_ctrt),
            priceChangeSign: priceData.prdy_vrss_sign,
            volume: parseInt(priceData.acml_vol),
            turnover: parseInt(priceData.acml_tr_pbmn),
            open: parseFloat(priceData.stck_oprc),
            high: parseFloat(priceData.stck_hgpr),
            low: parseFloat(priceData.stck_lwpr),
            previousClose: parseFloat(priceData.stck_prdy_clpr),
          },
        });
      }

      case "chart": {
        const chartData = await getStockDailyData(code);
        return NextResponse.json({
          success: true,
          data: {
            code,
            chartData: chartData.map((item) => ({
              date: item.date.toISOString().split("T")[0],
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
              volume: item.volume,
            })),
          },
        });
      }

      case "orderbook": {
        const orderbookData = await getStockOrderbook(code);
        return NextResponse.json({
          success: true,
          data: {
            code,
            orderbook: orderbookData,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "잘못된 action 파라미터입니다. (price, chart, orderbook)" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Stock API 오류:", error);
    return NextResponse.json(
      { success: false, error: "주식 데이터 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
