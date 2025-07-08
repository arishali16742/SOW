'use server';
/**
 * @fileOverview An AI agent that analyzes a document against a single custom prompt.
 *
 * - analyzeCustomPrompt - A function that handles the custom prompt analysis.
 * - AnalyzeCustomPromptInput - The input type for the analyzeCustomPrompt function.
 * - AnalyzeCustomPromptOutput - The return type for the analyzeCustomPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCustomPromptInputSchema = z.object({
  sowDocument: z.string().describe('The full text content of the Statement of Work document.'),
  customPrompt: z.string().describe('The custom question or check to perform against the document.'),
});
export type AnalyzeCustomPromptInput = z.infer<typeof AnalyzeCustomPromptInputSchema>;

const AnalyzeCustomPromptOutputSchema = z.object({
    status: z.enum(['passed', 'failed']).describe("The status of the check. 'failed' if the prompt's condition is met or an issue is found, 'passed' otherwise."),
    description: z.string().describe("A detailed description of the finding. Explain why the check passed or failed based on the prompt."),
    relevantText: z.string().describe("The EXACT, verbatim text snippet from the document that is most relevant to the custom prompt. If no specific text is relevant, provide a general sentence about the document's content."),
});
export type AnalyzeCustomPromptOutput = z.infer<typeof AnalyzeCustomPromptOutputSchema>;


export async function analyzeCustomPrompt(input: AnalyzeCustomPromptInput): Promise<AnalyzeCustomPromptOutput> {
    const strippedHtml = input.sowDocument.replace(/<[^>]*>?/gm, ' ');
    return analyzeCustomPromptFlow({ ...input, sowDocument: strippedHtml });
}


const prompt = ai.definePrompt({
  name: 'analyzeCustomPrompt',
  input: {schema: AnalyzeCustomPromptInputSchema},
  output: {schema: AnalyzeCustomPromptOutputSchema},
  prompt: `You are an AI document auditor. Your task is to analyze the provided document based on a single, user-defined custom prompt and return a structured JSON object with your findings.

**Document to Analyze:**
\`\`\`
{{{sowDocument}}}
\`\`\`

**Custom Prompt / Question:**
"{{{customPrompt}}}"

**Instructions:**
1.  Read the custom prompt carefully to understand what the user is asking to check.
2.  Analyze the document to answer the user's prompt.
3.  Determine if the check results in a "passed" or "failed" status. Generally, if the prompt is asking to find something and it exists, that might be considered a 'failed' state (as in, an issue was found). Use your best judgment. For a prompt like "Check whether the document has 'DRAFT'", finding "DRAFT" would mean the check has 'failed' (as it identified the issue). If the prompt was "Confirm the document is finalized", finding "DRAFT" would also mean a 'failed' status. If the prompt is "Is the sky blue?" this is not a check, so try to answer it in the description and set status to passed.
4.  Find the **EXACT, verbatim text snippet** from the document that is most relevant to the prompt. This is crucial for highlighting.
5.  Write a clear, concise description explaining your finding.

Please provide the output as a single JSON object, strictly following the output schema.`,
});

const analyzeCustomPromptFlow = ai.defineFlow(
  {
    name: 'analyzeCustomPromptFlow',
    inputSchema: AnalyzeCustomPromptInputSchema,
    outputSchema: AnalyzeCustomPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
