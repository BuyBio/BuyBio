"use client";

import { useState } from "react";

import supabase from "../../lib/supabaseClient";

export default function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (mode === "login") {
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

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "0 auto" }}>
      <h2>{mode === "login" ? "로그인" : "회원가입"}</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button type="submit" style={{ width: "100%" }}>
        {mode === "login" ? "로그인" : "회원가입"}
      </button>
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "회원가입으로" : "로그인으로"}
        </button>
      </div>
      {message && <p style={{ color: "red" }}>{message}</p>}
    </form>
  );
}
