import React, { cloneElement, isValidElement, useState } from "react";

import AuthForm from "@/components/ui/AuthForm";
import Header from "@/components/ui/header";
import MobileBottomNavigation from "@/components/ui/mobile-bottom-navigation";

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

  // 메뉴 항목 리스트
  const menuItems: { label: string; onClick: () => void }[] = [
    {
      label: "로그인/회원가입",
      onClick: () => {
        setSideOpen(false);
        setAuthModalOpen(true);
      },
    },
    {
      label: "내 정보",
      onClick: () => {
        /* TODO: 내 정보 기능 */
      },
    },
    {
      label: "테마",
      onClick: () => {
        /* TODO: 테마 기능 */
      },
    },
    {
      label: "로그아웃",
      onClick: () => {
        /* TODO: 로그아웃 기능 */
      },
    },
  ];

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
              className="absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-lg z-50 flex flex-col transition-transform duration-300"
              style={{
                transform: sideOpen ? "translateX(0)" : "translateX(100%)",
              }}
            >
              {/* X 닫기 버튼 (우측 상단) */}
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
                onClick={() => setSideOpen(false)}
                type="button"
                aria-label="닫기"
              >
                ×
              </button>
              <div className="flex-1 flex flex-col justify-start p-6">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className="w-full text-left px-4 py-3 rounded hover:bg-gray-100 font-medium text-base"
                    onClick={item.onClick}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                className="text-gray-400 text-sm mb-4"
                onClick={() => setSideOpen(false)}
                type="button"
              >
                닫기
              </button>
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
