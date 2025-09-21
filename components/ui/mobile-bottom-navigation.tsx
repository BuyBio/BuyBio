"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineSparkles,
} from "react-icons/hi";

export default function MobileBottomNavigation() {
  const pathname = usePathname();
  const hideOnPaths = ["/sign-in", "/sign-up"];
  const shouldShowBottomNav = !hideOnPaths.includes(pathname);

  if (!shouldShowBottomNav) return null;

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-white border-t border-gray-200 rounded-tl-[20px] rounded-tr-[20px] px-4 py-1">
      <Link
        href="/briefing"
        className={`flex flex-col items-center justify-center gap-[5px] h-16 w-[110px] transition-colors ${
          pathname === "/briefing"
            ? "text-gray-900"
            : "text-[#9fa4a6] hover:text-gray-900"
        }`}
        prefetch={false}
      >
        <HiOutlineClipboardList className="h-[26px] w-[26px]" />
        <span className="text-[11px] font-medium leading-[1.2] tracking-[-0.055px]">
          브리핑
        </span>
      </Link>
      <Link
        href="/stocks"
        className={`flex flex-col items-center justify-center gap-[5px] h-16 w-[110px] transition-colors ${
          pathname === "/stocks"
            ? "text-gray-900"
            : "text-[#9fa4a6] hover:text-gray-900"
        }`}
        prefetch={false}
      >
        <HiOutlineChartBar className="h-[26px] w-[26px]" />
        <span className="text-[11px] font-medium leading-[1.2] tracking-[-0.055px]">
          종목 탐색
        </span>
      </Link>
      <Link
        href="/ai-recommendations"
        className={`flex flex-col items-center justify-center gap-[5px] h-16 w-[110px] transition-colors ${
          pathname === "/ai-recommendations"
            ? "text-gray-900"
            : "text-[#9fa4a6] hover:text-gray-900"
        }`}
        prefetch={false}
      >
        <HiOutlineSparkles className="h-[26px] w-[26px]" />
        <span className="text-[11px] font-medium leading-[1.2] tracking-[-0.055px]">
          AI 추천
        </span>
      </Link>
    </nav>
  );
}
