"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

export default function AuthForm({
  onSuccess,
  mode,
}: {
  onSuccess?: () => void;
  mode?: "login" | "signup";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [internalMode, setInternalMode] = useState<"login" | "signup">("login");

  // mode prop이 있으면 내부 상태를 덮어씀
  useEffect(() => {
    if (mode) setInternalMode(mode);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMode = mode || internalMode;
    if (currentMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) {
        toast.success("로그인 성공!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(error.message);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (!error) {
        toast.success("회원가입 성공!", {
          description:
            "이메일로 전송된 인증 링크를 클릭하여 계정을 활성화해주세요.",
          duration: 5000,
        });
        if (onSuccess) onSuccess();
      } else {
        toast.error(error.message);
      }
    }
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: "google" | "kakao") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-xs mx-auto p-4"
    >
      <h2 className="text-xl font-bold text-center mb-2">
        {(mode || internalMode) === "login" ? "로그인" : "회원가입"}
      </h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded py-2 font-semibold hover:bg-blue-600 transition"
      >
        {(mode || internalMode) === "login" ? "로그인" : "회원가입"}
      </button>
      {/* 내부 모드 전환 버튼은 mode prop이 없을 때만 노출 */}
      {!mode && (
        <button
          type="button"
          onClick={() =>
            setInternalMode(internalMode === "login" ? "signup" : "login")
          }
          className="text-blue-500 underline text-sm"
        >
          {internalMode === "login" ? "회원가입으로" : "로그인으로"}
        </button>
      )}

      {/* 소셜 로그인 버튼 */}
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <img
            src="/auth/google_logo.webp"
            alt="Google로 로그인"
            className="w-6 h-6"
          />
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("kakao")}
          className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center hover:bg-[#FDD835] transition-colors"
        >
          <img
            src="/auth/kakao_logo.png"
            alt="카카오 로그인"
            className="w-6 h-6"
          />
        </button>
      </div>
    </form>
  );
}
