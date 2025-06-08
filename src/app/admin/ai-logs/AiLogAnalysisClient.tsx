
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { analyzeAiUsageLogs } from "@/ai/flows/analyze-ai-usage-logs";
import type { AnalyzeAiUsageLogsInput, AnalyzeAiUsageLogsOutput } from "@/ai/flows/analyze-ai-usage-logs";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AiLogAnalysisClient() {
  const [logsInput, setLogsInput] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalyzeAiUsageLogsOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!logsInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste third party usage logs to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const inputData: AnalyzeAiUsageLogsInput = { logs: logsInput };
      const result = await analyzeAiUsageLogs(inputData);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Third party usage logs have been analyzed successfully.",
      });
    } catch (e) {
      console.error("Error analyzing third party logs:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to analyze logs: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: `Error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Third Party Usage Logs</CardTitle>
          <CardDescription>
            Paste your third party usage logs in JSON format below to get an analysis summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='[{"timestamp": "...", "event": "...", "userId": "...", "details": {...}}, ...]'
            value={logsInput}
            onChange={(e) => setLogsInput(e.target.value)}
            rows={10}
            className="font-code text-sm"
          />
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Logs"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm text-muted-foreground">
              {analysisResult.summary}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

