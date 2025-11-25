"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import Header from "@/components/ui/header";
import { PopupCard } from "@/components/ui/popup-card";

import { useSession } from "next-auth/react";

interface InvestmentProfile {
  selections: string[];
  updatedAt?: string;
}

export default function Home() {
  const [showPopup, setShowPopup] = useState(true);
  const [profile, setProfile] = useState<InvestmentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      setProfile(null);
      return;
    }

    let active = true;
    const fetchProfile = async () => {
      setProfileLoading(true);
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
        if (active) {
          setProfileLoading(false);
        }
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
