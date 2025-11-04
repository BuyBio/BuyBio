"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "서버 설정에 문제가 있습니다.",
    AccessDenied: "접근이 거부되었습니다.",
    Verification: "인증 토큰이 만료되었거나 이미 사용되었습니다.",
    Default: "인증 중 오류가 발생했습니다.",
  };

  const errorMessage =
    errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">로그인 오류</h1>
        <p className="text-gray-700 mb-6">{errorMessage}</p>
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
            <p className="text-gray-700">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
