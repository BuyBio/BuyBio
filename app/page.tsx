"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import Header from "@/components/ui/header";
import { PopupCard } from "@/components/ui/popup-card";
import { StockTickerCard } from "@/components/ui/stock-ticker-card";

import { useSession } from "next-auth/react";

interface InvestmentProfile {
  selections: string[];
  updatedAt?: string;
}

export default function Home() {
  const [showPopup, setShowPopup] = useState(true);
  const [profile, setProfile] = useState<InvestmentProfile | null>(null);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      setProfile(null);
      return;
    }

    let active = true;
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/investment-profile");
        if (!response.ok) {
          if (response.status === 404 || response.status === 401) {
            if (active) setProfile(null);
            return;
          }
          throw new Error("failed to fetch");
        }
        const data = await response.json();
        if (active) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("투자 성향 불러오기 실패:", error);
        if (active) {
          setProfile(null);
        }
      } finally {
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [status]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleAction = () => {
    router.push("/persona");
  };

  const hasProfile = !!profile?.selections?.length;

  return (
    <MobileLayout
      header={
        <Header>
          <Header.Left>
            <Link href="/">
              <Header.Title>BUYO</Header.Title>
            </Link>
          </Header.Left>
          <Header.Right>
            <Header.MenuButton />
          </Header.Right>
        </Header>
      }
    >
      <div className="flex items-center justify-center min-h-full">
        <div className="w-full p-4 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  실시간 대표 종목
                </p>
              </div>
              <span className="text-[10px] uppercase text-slate-400">
                ws://3.26.94.208:8080
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StockTickerCard symbol="005930" label="삼성전자" />
              <StockTickerCard symbol="000660" label="SK하이닉스" />
              <StockTickerCard symbol="034020" label="두산에너빌리티" />
              <StockTickerCard symbol="298380" label="에이비엘바이오" />
              <StockTickerCard symbol="000650" label="천일고속" />
              <StockTickerCard symbol="066570" label="LG전자" />
              <StockTickerCard symbol="005380" label="현대자동차" />
              <StockTickerCard symbol="0009K0" label="에임드바이오" />
              <StockTickerCard symbol="064400" label="LG씨엔에스" />
              <StockTickerCard symbol="035420" label="NAVER" />
            </div>
          </section>

          <p className="text-gray-500 text-center">BuyBio App</p>

          {/* Popup Card Example */}
          {!hasProfile && showPopup && (
            <div className="w-full">
              <PopupCard onClose={handleClose} onAction={handleAction} />
            </div>
          )}

          {!hasProfile && !showPopup && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                투자 성향 팝업이 닫혔습니다
              </p>
              <button
                type="button"
                onClick={() => setShowPopup(true)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                다시 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
