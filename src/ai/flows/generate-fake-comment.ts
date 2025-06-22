'use server';
/**
 * @fileOverview A flow to generate a fake user comment for a piece of content.
 *
 * - generateFakeComment - A function that generates a user comment.
 * - GenerateFakeCommentInput - The input type for the generateFakeComment function.
 * - GenerateFakeCommentOutput - The return type for the generateFakeComment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFakeCommentInputSchema = z.object({
  contentTitle: z.string().describe('The title of the content to comment on.'),
  contentDescription: z.string().describe('A brief description of the content.'),
  sentiment: z.enum(['positive', 'negative', 'neutral']).describe('The desired sentiment of the comment.'),
});
export type GenerateFakeCommentInput = z.infer<typeof GenerateFakeCommentInputSchema>;

const GenerateFakeCommentOutputSchema = z.object({
  comment: z.string().describe('The generated fake user comment.'),
  username: z.string().describe('A plausible but fake username for the commenter.'),
});
export type GenerateFakeCommentOutput = z.infer<typeof GenerateFakeCommentOutputSchema>;

export async function generateFakeComment(input: GenerateFakeCommentInput): Promise<GenerateFakeCommentOutput> {
  return generateFakeCommentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFakeCommentPrompt',
  input: {schema: GenerateFakeCommentInputSchema},
  output: {schema: GenerateFakeCommentOutputSchema},
  prompt: `You are an expert at creating plausible, but entirely fake, user comments for social media content.
Generate a fake comment for a piece of content with the following details:
Title: {{{contentTitle}}}
Description: {{{contentDescription}}}

The comment should have a '{{sentiment}}' sentiment.
Keep the comment concise and realistic, as if a real user wrote it.
Also, generate a plausible but fake username for the person who might have written this comment.
Do not use emojis.
`,
});

const generateFakeCommentFlow = ai.defineFlow(
  {
    name: 'generateFakeCommentFlow',
    inputSchema: GenerateFakeCommentInputSchema,
    outputSchema: GenerateFakeCommentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
