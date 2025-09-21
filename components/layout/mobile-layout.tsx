import type React from "react";

import MobileBottomNavigation from "@/components/ui/mobile-bottom-navigation";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = "" }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50">
      <main
        className={`relative w-full max-w-[375px] bg-white shadow-xl ${className}`}
      >
        {children}
        <MobileBottomNavigation />
      </main>
    </div>
  );
}
