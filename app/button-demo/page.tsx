import { Button } from "@/components/ui/button";

export default function ButtonDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Button Component Demo
          </h1>
          <p className="text-gray-600">
            Customized buttons based on Figma design specifications
          </p>
        </div>

        {/* Figma Design Variants */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Figma Design Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Button/Main Variant */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Button/Main</h3>
              <div className="space-y-3">
                <Button variant="main" className="w-full">
                  진단 시작하기
                </Button>
                <Button variant="main" className="w-full" disabled>
                  진단 시작하기 (Disabled)
                </Button>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Background: #579bfe (default), #3984f1 (hover)</p>
                <p>• Text: White, Semibold weight</p>
                <p>• Border radius: 14px</p>
                <p>• Height: 51px</p>
              </div>
            </div>

            {/* Button/Sub Variant */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Button/Sub</h3>
              <div className="space-y-3">
                <Button variant="sub" className="w-full">
                  나중에
                </Button>
                <Button variant="sub" className="w-full" disabled>
                  나중에 (Disabled)
                </Button>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Background: #eef1f6 (default), #dce3ee (hover)</p>
                <p>• Text: #5b5f61, Medium weight</p>
                <p>• Border radius: 14px</p>
                <p>• Height: 51px</p>
              </div>
            </div>
          </div>
        </div>

        {/* Original Variants for Comparison */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Original Variants (for comparison)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>

        {/* Size Variants */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Size Variants
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <Button variant="main" size="sm">
              Small Main
            </Button>
            <Button variant="main" size="default">
              Default Main
            </Button>
            <Button variant="main" size="lg">
              Large Main
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button variant="sub" size="sm">
              Small Sub
            </Button>
            <Button variant="sub" size="default">
              Default Sub
            </Button>
            <Button variant="sub" size="lg">
              Large Sub
            </Button>
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Interactive Examples
          </h2>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">투자 성향 진단</h3>
            <p className="text-gray-600 mb-6">
              내 투자 성향을 확인해 보세요. 간단한 진단 후, 내게 맞는 종목을
              추천드려요.
            </p>
            <div className="space-y-3">
              <Button variant="main" className="w-full">
                진단 시작하기
              </Button>
              <Button variant="sub" className="w-full">
                나중에
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              건너 뛰어도 언제든 다시 할 수 있어요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
