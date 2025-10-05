"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 실시간 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <a href="/" className="text-blue-500 underline">
          홈으로 이동
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">프로필</h1>

        <div className="space-y-4">
          {user.user_metadata?.avatar_url && (
            <div className="flex justify-center">
              <img
                src={user.user_metadata.avatar_url}
                alt="프로필 사진"
                className="w-24 h-24 rounded-full"
              />
            </div>
          )}

          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">이메일</p>
            <p className="font-semibold">{user.email}</p>
          </div>

          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">이름</p>
            <p className="font-semibold">
              {user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "없음"}
            </p>
          </div>

          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">로그인 제공자</p>
            <p className="font-semibold capitalize">
              {user.app_metadata?.provider || "email"}
            </p>
          </div>

          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">사용자 ID</p>
            <p className="font-mono text-sm">{user.id}</p>
          </div>

          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">가입일</p>
            <p className="text-sm">
              {new Date(user.created_at || "").toLocaleDateString("ko-KR")}
            </p>
          </div>

          <div className="border-b pb-2">
            <p className="text-sm text-gray-500">마지막 로그인</p>
            <p className="text-sm">
              {new Date(user.last_sign_in_at || "").toLocaleString("ko-KR")}
            </p>
          </div>

          {/* 전체 유저 메타데이터 표시 (디버깅용) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500">
              전체 사용자 정보 (디버깅)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white rounded py-2 font-semibold hover:bg-red-600 transition mt-6"
          >
            로그아웃
          </button>

          <a
            href="/"
            className="block text-center text-blue-500 underline text-sm mt-2"
          >
            홈으로 이동
          </a>
        </div>
      </div>
    </div>
  );
}
