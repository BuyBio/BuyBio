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
  const [modalOpen, setModalOpen] = useState(false);

  // Header.MenuButton에 onClick 자동 주입
  let headerWithMenuHandler = header;
  if (header && isValidElement(header)) {
    headerWithMenuHandler = cloneElement(
      header,
      {},
      React.Children.map(
        (
          header as React.ReactElement<{
            children?: React.ReactNode;
          }>
        ).props.children,
        (child: React.ReactNode) => {
          if (!isValidElement(child)) return child;

          // Header.Right 내부에 MenuButton이 있는지 확인
          if (child.type === Header.Right) {
            return cloneElement(
              child,
              {},
              React.Children.map(
                (
                  child as React.ReactElement<{
                    children?: React.ReactNode;
                  }>
                ).props.children,
                (rightChild: React.ReactNode) => {
                  if (
                    isValidElement(rightChild) &&
                    rightChild.type === Header.MenuButton
                  ) {
                    return cloneElement(
                      rightChild as React.ReactElement<
                        React.JSX.IntrinsicElements["button"]
                      >,
                      {
                        onClick: () => setModalOpen(true),
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
        {modalOpen && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <AuthForm onSuccess={() => setModalOpen(false)} />
              {/* a11y 규칙 준수: button에 type 명시 */}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ marginTop: 12 }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
        <style jsx>{`
          .modal-backdrop {
            position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            background: #fff; border-radius: 8px; padding: 24px; min-width: 320px;
          }
        `}</style>
      </main>
    </div>
  );
}
