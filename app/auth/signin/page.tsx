"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { signIn } from "next-auth/react";
import { toast } from "sonner";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      toast.error("Google 로그인 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      await signIn("kakao", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      toast.error("카카오 로그인 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BuyBio</h1>
        </div>

        <div className="space-y-4">
          {/* Google 로그인 버튼 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <img
              src="/auth/google_logo.webp"
              alt="Google"
              className="w-6 h-6"
            />
            <span className="text-gray-700 font-medium">Google로 계속하기</span>
          </button>

          {/* Kakao 로그인 버튼 */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <img src="/auth/kakao_logo.png" alt="Kakao" className="w-6 h-6" />
            <span className="text-gray-900 font-medium">카카오로 계속하기</span>
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            로그인 시 BuyBio의{" "}
            <a
              href="/terms"
              className="text-blue-600 hover:underline hover:text-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              이용약관
            </a>{" "}
            및{" "}
            <a
              href="/privacy"
              className="text-blue-600 hover:underline hover:text-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
