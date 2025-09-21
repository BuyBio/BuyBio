export default function BriefingPage() {
  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">브리핑</h1>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">오늘의 시장 동향</h2>
          <p className="text-gray-600">코스피 2,450.25 (+1.2%)</p>
          <p className="text-gray-600">코스닥 789.10 (-0.5%)</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">주요 뉴스</h2>
          <p className="text-gray-600">• 반도체 섹터 강세 지속</p>
          <p className="text-gray-600">• 바이오 관련주 상승세</p>
          <p className="text-gray-600">• 금리 인하 기대감 확산</p>
        </div>
      </div>
    </div>
  );
}
