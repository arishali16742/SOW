'use server';
/**
 * @fileOverview An AI agent that suggests improvements for SOW documents.
 *
 * - suggestSowImprovements - A function that handles the suggestion process.
 * - SuggestSowImprovementsInput - The input type for the suggestSowImprovements function.
 * - SuggestSowImprovementsOutput - The return type for the suggestSowImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSowImprovementsInputSchema = z.object({
  sowDocument: z
    .string()
    .describe('The full text content of the Statement of Work document.'),
  issueDescription: z
    .string()
    .describe('A description of the issue identified in the SOW document.'),
  relevantText: z
    .string()
    .describe('The specific text from the SOW document related to the issue.'),
});
export type SuggestSowImprovementsInput = z.infer<typeof SuggestSowImprovementsInputSchema>;

const SuggestSowImprovementsOutputSchema = z.object({
  suggestedImprovements: z
    .array(z.string())
    .describe('An array of suggested improvements for the identified issue.'),
});
export type SuggestSowImprovementsOutput = z.infer<typeof SuggestSowImprovementsOutputSchema>;

export async function suggestSowImprovements(input: SuggestSowImprovementsInput): Promise<SuggestSowImprovementsOutput> {
  return suggestSowImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSowImprovementsPrompt',
  input: {schema: SuggestSowImprovementsInputSchema},
  output: {schema: SuggestSowImprovementsOutputSchema},
  prompt: `You are an AI assistant specializing in improving Statement of Work (SOW) documents.

You will be provided with a section of an SOW document, a description of an issue found in that section, and the specific text related to the issue.
Your task is to suggest improvements to correct the issue.

SOW Document:
{{{sowDocument}}}

Issue Description:
{{{issueDescription}}}

Relevant Text:
{{{relevantText}}}

Suggested Improvements:
`, // Ensure the output is an array of strings
});

const suggestSowImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestSowImprovementsFlow',
    inputSchema: SuggestSowImprovementsInputSchema,
    outputSchema: SuggestSowImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
