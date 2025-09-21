export default function AIRecommendationsPage() {
  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">AI 추천</h1>
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <div className="text-sm text-blue-800 mb-1">AI 분석 기반</div>
        <div className="text-lg font-semibold">오늘의 추천 종목</div>
      </div>
      <div className="space-y-3">
        <div className="p-4 border rounded">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold">현대차</div>
              <div className="text-sm text-gray-600">005380</div>
            </div>
            <div className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
              매수
            </div>
          </div>
          <div className="text-sm text-gray-600">
            AI 예측: 향후 1주일 내 +5% 상승 예상
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold">카카오</div>
              <div className="text-sm text-gray-600">035720</div>
            </div>
            <div className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
              보유
            </div>
          </div>
          <div className="text-sm text-gray-600">
            AI 예측: 단기 변동성 증가, 관망 권장
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold">포스코</div>
              <div className="text-sm text-gray-600">005490</div>
            </div>
            <div className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded">
              매도
            </div>
          </div>
          <div className="text-sm text-gray-600">
            AI 예측: 실적 우려로 하락 압력 예상
          </div>
        </div>
      </div>
    </div>
  );
}
