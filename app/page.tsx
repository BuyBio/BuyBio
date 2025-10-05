"use client";

import Link from "next/link";
import { useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import Header from "@/components/ui/header";
import { PopupCard } from "@/components/ui/popup-card";

export default function Home() {
  const [showPopup, setShowPopup] = useState(true);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleAction = () => {
    alert("투자 성향 진단을 시작합니다!");
  };

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
          {showPopup && (
            <div className="w-full">
              <PopupCard onClose={handleClose} onAction={handleAction} />
            </div>
          )}

          {!showPopup && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">팝업이 닫혔습니다</p>
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
