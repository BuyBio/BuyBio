import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import { getUapiDomesticStockV1QuotationsInquirePrice } from "kis-typescript-sdk";

// Supabase 클라이언트 (서버 키로 생성)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 서버에서만 사용
);

export const GET = async (req: Request) => {
  // 1. 유저 access_token 추출 및 검증
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    // access_token이 없으면 401 에러 반환
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  // Supabase JWT 검증 (유저 인증)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    // 토큰이 유효하지 않으면 401 에러 반환
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // 2. 인증된 유저만 KIS API 호출 (KIS Access Token은 서버에서만 사용)
  try {
    const response = await getUapiDomesticStockV1QuotationsInquirePrice({
      FID_INPUT_ISCD: "005930", // 삼성전자 종목코드
      FID_COND_MRKT_DIV_CODE: "J", // KOSPI 시장 코드
    });
    // 3. KIS API에서 받은 결과를 유저에게 반환
    return NextResponse.json(response.data);
  } catch (error) {
    // KIS API 호출 실패 시 500 에러 반환
    console.error(
      "Failed to fetch stock quotation:",
      JSON.stringify(error, null, 3),
    );
    return NextResponse.json(
      { error: "Failed to fetch stock quotation" },
      { status: 500 },
    );
  }
};
