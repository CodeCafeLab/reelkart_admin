'use server';
/**
 * @fileOverview Analyzes AI usage logs to identify patterns, issues, and optimization areas.
 *
 * - analyzeAiUsageLogs - A function that analyzes AI usage logs and provides a summary.
 * - AnalyzeAiUsageLogsInput - The input type for the analyzeAiUsageLogs function.
 * - AnalyzeAiUsageLogsOutput - The return type for the analyzeAiUsageLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAiUsageLogsInputSchema = z.object({
  logs: z
    .string()
    .describe('AI usage logs in JSON format.'),
});
export type AnalyzeAiUsageLogsInput = z.infer<typeof AnalyzeAiUsageLogsInputSchema>;

const AnalyzeAiUsageLogsOutputSchema = z.object({
  summary: z.string().describe('A summary of AI usage patterns, issues, and optimization areas.'),
});
export type AnalyzeAiUsageLogsOutput = z.infer<typeof AnalyzeAiUsageLogsOutputSchema>;

export async function analyzeAiUsageLogs(input: AnalyzeAiUsageLogsInput): Promise<AnalyzeAiUsageLogsOutput> {
  return analyzeAiUsageLogsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAiUsageLogsPrompt',
  input: {schema: AnalyzeAiUsageLogsInputSchema},
  output: {schema: AnalyzeAiUsageLogsOutputSchema},
  prompt: `You are an AI log analyzer. Analyze the following AI usage logs and provide a summary of usage patterns, potential issues, and areas for optimization.\n\nLogs: {{{logs}}}`,
});

const analyzeAiUsageLogsFlow = ai.defineFlow(
  {
    name: 'analyzeAiUsageLogsFlow',
    inputSchema: AnalyzeAiUsageLogsInputSchema,
    outputSchema: AnalyzeAiUsageLogsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
