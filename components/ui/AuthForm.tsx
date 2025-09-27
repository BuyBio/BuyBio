"use client";

import { useEffect, useState } from "react";

import supabase from "../../lib/supabaseClient";

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
  const [message, setMessage] = useState("");

  // mode prop이 있으면 내부 상태를 덮어씀
  useEffect(() => {
    if (mode) setInternalMode(mode);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const currentMode = mode || internalMode;
    if (currentMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) {
        setMessage("로그인 성공!");
        if (onSuccess) onSuccess();
      } else {
        setMessage(error.message);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (!error) {
        setMessage("회원가입 성공! 이메일을 확인하세요.");
        if (onSuccess) onSuccess();
      } else {
        setMessage(error.message);
      }
    }
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: "google" | "kakao") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-xs mx-auto p-4"
    >
      {/* 소셜 로그인 버튼 */}
      <div className="flex flex-col gap-2 my-2">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="w-full bg-white border border-gray-300 rounded py-2 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          {/* <img src="/google-icon.svg" alt="Google" className="w-5 h-5" /> */}
          Google로 로그인
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("kakao")}
          className="w-full bg-yellow-300 rounded py-2 font-semibold flex items-center justify-center gap-2 hover:bg-yellow-200"
        >
          {/* <img src="/kakao-icon.svg" alt="Kakao" className="w-5 h-5" /> */}
          카카오톡으로 로그인
        </button>
      </div>
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
      <button
        type="button"
        onClick={onSuccess}
        className="text-gray-400 text-sm mt-2"
      >
        닫기
      </button>
      {message && <p className="text-center text-red-500 text-sm">{message}</p>}
    </form>
  );
}
