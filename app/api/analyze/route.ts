import { NextResponse } from "next/server";

// FastAPI 서버 주소 (개발용). 배포 시 환경변수로 분리 권장
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/analyze`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "backend error" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "unreachable" }, { status: 500 });
  }
}
