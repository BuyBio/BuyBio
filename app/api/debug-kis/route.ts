import { NextResponse } from "next/server";

export async function GET() {
  const KIS_APP_KEY = process.env.KIS_APP_KEY;
  const KIS_APP_SECRET = process.env.KIS_APP_SECRET;
  const KIS_ACCESS_TOKEN = process.env.KIS_ACCESS_TOKEN;

  return NextResponse.json({
    success: true,
    debug: {
      hasAppKey: !!KIS_APP_KEY,
      hasAppSecret: !!KIS_APP_SECRET,
      hasAccessToken: !!KIS_ACCESS_TOKEN,
      appKeyLength: KIS_APP_KEY?.length || 0,
      appSecretLength: KIS_APP_SECRET?.length || 0,
      accessTokenLength: KIS_ACCESS_TOKEN?.length || 0,
      appKeyPreview: KIS_APP_KEY ? `${KIS_APP_KEY.substring(0, 8)}...` : "없음",
      appSecretPreview: KIS_APP_SECRET
        ? `${KIS_APP_SECRET.substring(0, 8)}...`
        : "없음",
    },
  });
}
