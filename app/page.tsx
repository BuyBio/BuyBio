"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import Header from "@/components/ui/header";
import { PopupCard } from "@/components/ui/popup-card";
import { StockTickerCard } from "@/components/ui/stock-ticker-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSession } from "next-auth/react";

interface InvestmentProfile {
  selections: string[];
  updatedAt?: string;
}

type RankingTabValue = "rise" | "fall" | "volume" | "amount";

const rankingTabs: { value: RankingTabValue; label: string; accent: string }[] =
  [
    { value: "rise", label: "상승", accent: "text-rose-600" },
    { value: "fall", label: "하락", accent: "text-slate-600" },
    { value: "volume", label: "거래량", accent: "text-blue-600" },
    { value: "amount", label: "거래대금", accent: "text-emerald-600" },
  ];

const rankingData: Record<RankingTabValue, { name: string; value: string }[]> =
  {
    rise: [
      { name: "에이비엘바이오", value: "+7.3%" },
      { name: "두산에너빌리티", value: "+5.1%" },
      { name: "NAVER", value: "+3.8%" },
    ],
    fall: [
      { name: "천일고속", value: "-2.4%" },
      { name: "SK하이닉스", value: "-1.7%" },
      { name: "LG전자", value: "-1.1%" },
    ],
    volume: [
      { name: "삼성전자", value: "12.4M" },
      { name: "현대자동차", value: "9.1M" },
      { name: "LG전자", value: "7.8M" },
    ],
    amount: [
      { name: "삼성전자", value: "1.2조" },
      { name: "NAVER", value: "0.9조" },
      { name: "현대자동차", value: "0.7조" },
    ],
  };

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
          {/* <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
          </section> */}

          <section className="rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  종목 랭킹
                </p>
              </div>
            </div>
            <Tabs defaultValue="rise" className="mt-3">
              <TabsList className="grid grid-cols-4 gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-500">
                {rankingTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-full px-3 py-2 text-xs data-[state=active]:bg-rose-100 data-[state=active]:text-rose-600 data-[state=active]:shadow-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {rankingTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-3">
                  <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
                    {rankingData[tab.value].map((item) => (
                      <div
                        key={`${tab.value}-${item.name}`}
                        className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                      >
                        <span>{item.name}</span>
                        <span className={`font-semibold ${tab.accent}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* <p className="text-gray-500 text-center">BuyBio App</p> */}

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
