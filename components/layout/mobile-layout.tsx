import type React from "react";

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
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50">
      <main
        className={`relative flex flex-col w-full max-w-[436px] h-screen bg-white shadow-xl ${className}`}
      >
        {header || <Header />}
        <div className="flex-1 overflow-y-auto pt-[52px] pb-[56px]">
          {children}
        </div>
        <MobileBottomNavigation />
      </main>
    </div>
  );
}
