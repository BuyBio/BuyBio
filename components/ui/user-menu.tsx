"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import type { User } from "@supabase/supabase-js";
import { IoPersonCircle } from "react-icons/io5";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="프로필"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <IoPersonCircle className="w-6 h-6" />
        )}
      </button>

      {showMenu && (
        <>
          {/* 배경 클릭시 메뉴 닫기 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowMenu(false)}
          />

          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">로그인됨</p>
              <p className="font-semibold truncate">{user.email}</p>
            </div>

            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setShowMenu(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
              >
                회원정보
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
