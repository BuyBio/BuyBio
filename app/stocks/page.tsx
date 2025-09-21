export default function StocksPage() {
  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">종목 탐색</h1>
      <input
        type="text"
        placeholder="종목명 또는 코드 검색"
        className="w-full p-2 border rounded mb-4"
      />
      <div className="space-y-2">
        <div className="p-3 border rounded">
          <div className="font-semibold">삼성전자</div>
          <div className="text-sm text-gray-600">005930 • 72,500원 (+2.1%)</div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-semibold">SK하이닉스</div>
          <div className="text-sm text-gray-600">
            000660 • 198,000원 (+3.5%)
          </div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-semibold">LG화학</div>
          <div className="text-sm text-gray-600">
            051910 • 345,000원 (-1.2%)
          </div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-semibold">네이버</div>
          <div className="text-sm text-gray-600">
            035420 • 215,500원 (+0.8%)
          </div>
        </div>
      </div>
    </div>
  );
}
