import type React from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = "" }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50">
      <div className={`w-full max-w-[375px] bg-white shadow-xl ${className}`}>
        {children}
      </div>
    </div>
  );
}
