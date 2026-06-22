"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AIAnalysisCard } from "@/components/listings/AIAnalysisCard";

type AIAnalysisSectionProps = {
  listingId: string;
};

// TODO: Replace with actual AI analysis from API
type MockAIAnalysis = {
  rentalYield: number | null;
  paybackYears: number | null;
  liquidityScore: number | null;
  marketComparison: string | null;
  recommendation: string;
  summary: string;
};

export function AIAnalysisSection({ listingId: _listingId }: AIAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<MockAIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call to /api/ai/analyze when ANTHROPIC_API_KEY is available
      // const response = await fetch(`/api/ai/analyze/${listingId}`);
      // const data = await response.json();

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAnalysis: MockAIAnalysis = {
        rentalYield: 6.8,
        paybackYears: 14.7,
        liquidityScore: 7.5,
        marketComparison:
          "Bu əmlakın qiyməti bazarın orta səviyyəsindən 12% aşağıdır. Oxşar əmlaklar bu ərazidə 15-20% daha baha satılır.",
        recommendation: "Yaxşı investisiya imkanı",
        summary:
          "Yüksək kirayə gəliri potensialı və əlverişli qiymət. Ərazinin inkişaf tempi yaxşıdır.",
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError("Analiz zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (analysis) {
    return <AIAnalysisCard analysis={analysis} />;
  }

  return (
    <Card className="text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="mb-2 text-xl font-semibold text-text-primary">
            AI Analiz
          </h3>
          <p className="text-sm text-text-muted">
            Kirayə gəliri, investisiya potensialı və bazar müqayisəsi haqqında
            detallı analiz əldə edin
          </p>
        </div>
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        <Button
          variant="primary"
          onClick={fetchAnalysis}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Analiz edilir...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              AI Analiz Əldə Et
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
