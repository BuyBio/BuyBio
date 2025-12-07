import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Storage 접근이 차단된 경우를 대비한 에러 처리
  if (typeof window === "undefined") {
    // 서버 사이드에서는 클라이언트를 생성하지 않음
    throw new Error("createClient는 클라이언트에서만 사용 가능합니다");
  }

  try {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  } catch (error) {
    // Storage 접근이 차단된 경우 (브라우저 확장 프로그램, 쿠키 차단 등)
    console.warn("Storage 접근 실패:", error);
    // 기본 클라이언트 반환 (에러는 무시하고 계속 진행)
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
}
