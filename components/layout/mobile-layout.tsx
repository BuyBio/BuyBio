import Link from "next/link";
import React, {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from "react";

import AuthForm from "@/components/ui/AuthForm";
import Header from "@/components/ui/header";
import MobileBottomNavigation from "@/components/ui/mobile-bottom-navigation";
import { createClient } from "@/lib/supabase/client";

import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}

export function MobileLayout({
  children,
  className = "",
  header,
}: MobileLayoutProps) {
  const [sideOpen, setSideOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // OAuth 로그인 성공 시 토스트 표시
      if (event === "SIGNED_IN" && session?.user) {
        toast.success("로그인 성공!");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Header.MenuButton에 onClick 자동 주입
  let headerWithMenuHandler = header;
  if (header && isValidElement(header)) {
    headerWithMenuHandler = cloneElement(
      header,
      {},
      React.Children.map(
        (header as React.ReactElement<{ children?: React.ReactNode }>).props
          .children,
        (child: React.ReactNode) => {
          if (!isValidElement(child)) return child;

          if (child.type === Header.Right) {
            return cloneElement(
              child,
              {},
              React.Children.map(
                (child as React.ReactElement<{ children?: React.ReactNode }>)
                  .props.children,
                (rightChild: React.ReactNode) => {
                  if (
                    isValidElement(rightChild) &&
                    rightChild.type === Header.MenuButton
                  ) {
                    return cloneElement(
                      rightChild as React.ReactElement<{
                        onClick?: () => void;
                      }>,
                      {
                        onClick: () => setSideOpen(true),
                      },
                    );
                  }
                  return rightChild;
                },
              ),
            );
          }
          return child;
        },
      ),
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSideOpen(false);
    toast.success("로그아웃되었습니다");
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50">
      <main
        className={`relative flex flex-col w-full max-w-[436px] h-screen bg-white shadow-xl ${className}`}
      >
        {headerWithMenuHandler || <Header />}
        <div className="flex-1 overflow-y-auto pt-[52px] pb-[56px]">
          {children}
        </div>
        <MobileBottomNavigation />

        {/* 사이드 패널 */}
        {sideOpen && (
          <>
            <button
              type="button"
              className="absolute inset-0 bg-black/30 z-40"
              onClick={() => setSideOpen(false)}
              onKeyDown={(e) => e.key === "Enter" && setSideOpen(false)}
              aria-label="배경 닫기"
            />
            <aside
              className="absolute top-0 right-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col transition-transform duration-300"
              style={{
                transform: sideOpen ? "translateX(0)" : "translateX(100%)",
              }}
            >
              <div className="flex justify-between items-center mb-6 p-6 pb-0">
                <h2 className="text-xl font-bold">메뉴</h2>
                <button
                  type="button"
                  onClick={() => setSideOpen(false)}
                  className="text-2xl"
                >
                  ×
                </button>
              </div>
              <nav className="space-y-4 p-6">
                {user ? (
                  <>
                    <div className="pb-4 border-b">
                      <p className="text-sm text-gray-500">로그인됨</p>
                      <p className="font-semibold truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setSideOpen(false)}
                      className="block py-2 hover:text-blue-500"
                    >
                      회원정보
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSideOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="block w-full text-left py-2 hover:text-blue-500"
                  >
                    로그인 / 회원가입
                  </button>
                )}
              </nav>
            </aside>
          </>
        )}

        {/* 전체 화면 모달: 로그인/회원가입 */}
        {authModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs mx-auto relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => setAuthModalOpen(false)}
                aria-label="닫기"
                type="button"
              >
                ×
              </button>
              <AuthForm onSuccess={() => setAuthModalOpen(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
