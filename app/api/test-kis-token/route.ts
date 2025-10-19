import { NextResponse } from "next/server";

import axios from "axios";

export async function GET() {
  const KIS_APP_KEY = process.env.KIS_APP_KEY;
  const KIS_APP_SECRET = process.env.KIS_APP_SECRET;

  if (!KIS_APP_KEY || !KIS_APP_SECRET) {
    return NextResponse.json({
      success: false,
      error: "KIS API 키가 설정되지 않았습니다.",
      debug: {
        hasAppKey: !!KIS_APP_KEY,
        hasAppSecret: !!KIS_APP_SECRET,
      },
    });
  }

  try {
    // 실투자용 URL로 토큰 발급 테스트
    const response = await axios.post(
      "https://openapi.koreainvestment.com:9443/oauth2/tokenP",
      {
        grant_type: "client_credentials",
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        access_token: response.data.access_token?.substring(0, 20) + "...",
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      },
    });
  } catch (error: any) {
    console.error("KIS 토큰 발급 오류:", error.response?.data || error.message);

    return NextResponse.json({
      success: false,
      error: "KIS API 토큰 발급 실패",
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      },
    });
  }
}
