"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { MobileLayout } from "@/components/layout/mobile-layout";
import Header from "@/components/ui/header";
import { getInvestmentOption } from "@/constants/investment-preferences";

import { signOut, useSession } from "next-auth/react";
import { IoPersonCircle } from "react-icons/io5";

interface InvestmentProfile {
  selections: string[];
  updatedAt?: string;
}

function PersonaSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gray-100" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="h-3 w-48 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-gray-100" />
        <div className="h-16 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

function InvestmentPersonaCard({ profile }: { profile: InvestmentProfile }) {
  const tags = profile.selections.join(" · ");
  const insights = useMemo(() => {
    return profile.selections
      .map((keyword) => getInvestmentOption(keyword))
      .filter((option): option is NonNullable<typeof option> =>
        Boolean(option),
      );
  }, [profile.selections]);

  const updatedLabel = profile.updatedAt
    ? new Intl.DateTimeFormat("ko-KR", {
        month: "short",
        day: "numeric",
      }).format(new Date(profile.updatedAt))
    : null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500">나의 투자 성향</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{tags}</p>
          {updatedLabel && (
            <p className="mt-1 text-[11px] text-gray-400">
              {updatedLabel} 업데이트
            </p>
          )}
        </div>
        <span className="rounded-full bg-gray-900/5 px-3 py-1 text-[11px] font-semibold text-gray-700">
          맞춤 분석
        </span>
      </div>

      {insights.length > 0 && (
        <div className="mt-4 space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.keyword}
              className="rounded-xl border border-gray-100 bg-slate-50/70 p-3 text-sm text-gray-700"
            >
              <span className="text-xs font-semibold text-emerald-600">
                #{insight.keyword}
              </span>
              <p className="mt-1">{insight.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [investProfile, setInvestProfile] = useState<InvestmentProfile | null>(
    null,
  );
  const [investLoading, setInvestLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      setInvestProfile(null);
      return;
    }

    let active = true;
    const loadProfile = async () => {
      setInvestLoading(true);
      try {
        const response = await fetch("/api/investment-profile");
        if (!response.ok) {
          if (active) setInvestProfile(null);
          return;
        }
        const data = await response.json();
        if (active) {
          setInvestProfile(data.profile);
        }
      } catch {
        if (active) {
          setInvestProfile(null);
        }
      } finally {
        if (active) {
          setInvestLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [status]);

  const user = session?.user;

  return (
    <MobileLayout
      header={
        <Header>
          <Header.Left>
            <Header.BackButton onClick={() => router.back()} />
          </Header.Left>
          <Header.Center>
            <Header.Title>회원정보</Header.Title>
          </Header.Center>
          <Header.Right>
            <Header.MenuButton />
          </Header.Right>
        </Header>
      }
    >
      <div className="flex h-full min-h-full flex-col gap-6 bg-gray-50 px-4 py-6">
        {status === "loading" && <PersonaSkeleton />}

        {status === "authenticated" && user && (
          <>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="프로필 이미지"
                    className="h-16 w-16 rounded-2xl border border-gray-100 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-slate-50 text-slate-400">
                    <IoPersonCircle className="h-9 w-9" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">로그인된 계정</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {user.name || "BuyBio 회원"}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4">
                  <dt className="text-xs text-gray-500">회원 ID</dt>
                  <dd className="mt-1 text-base font-semibold text-gray-900">
                    {user.id
                      ? `#${user.id.slice(0, 12).toUpperCase()}`
                      : "발급 준비 중"}
                  </dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4">
                  <dt className="text-xs text-gray-500">계정 상태</dt>
                  <dd className="mt-1 text-base font-semibold text-emerald-600">
                    정상
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">
                연락처 및 보안
              </h2>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500">이메일</p>
                    <p className="font-medium text-gray-900">
                      {user.email || "등록된 이메일이 없습니다"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500">연결된 계정</p>
                    <p className="font-medium text-gray-900">
                      {user.name ? `${user.name} 계정` : "SNS 계정"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    SSO
                  </span>
                </div>
              </div>
            </section>

            {investLoading && <PersonaSkeleton />}

            {!investLoading && investProfile && (
              <InvestmentPersonaCard profile={investProfile} />
            )}

            {!investLoading && !investProfile && (
              <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
                <p className="font-semibold text-gray-900">
                  아직 투자 성향 진단을 완료하지 않았어요
                </p>
                <p className="mt-2 text-gray-500">
                  간단한 설문으로 나의 투자 성향을 등록하면 맞춤 추천이
                  제공됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/persona")}
                  className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  투자 성향 진단하러 가기
                </button>
              </section>
            )}

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-auto w-full rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              로그아웃
            </button>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
