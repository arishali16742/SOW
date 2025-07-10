'use server';
/**
 * @fileOverview An AI agent that analyzes SOW documents against a dynamic set of rules.
 *
 * - analyzeSowDocument - A function that handles the SOW analysis process.
 * - AnalyzeSowDocumentInput - The input type for the analyzeSowDocument function.
 * - AnalyzeSowDocumentOutput - The return type for the analyzeSowDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SowCheckSchema = z.object({
  id: z.string().describe('A unique identifier for the check (e.g., "check1", "check2").'),
  title: z.string().describe('The title of the check being performed.'),
  prompt: z.string().describe('The detailed instructions for the AI on how to perform this check.'),
});

// Define the Zod schema for an individual issue, mirroring the `Issue` interface.
const IssueSchema = z.object({
  id: z.string().describe('A unique identifier for the check (e.g., "check1", "check2").'),
  title: z.string().describe('The title of the check being performed.'),
  status: z.enum(['passed', 'failed']).describe('The status of the check.'),
  description: z.string().describe('A detailed description of the finding. Explains why it passed or failed.'),
  relevantText: z.string().describe('The EXACT, verbatim text snippet from the document that is relevant to this issue. This text will be used for highlighting. If no specific text is relevant (e.g., a missing section), provide a sentence from the document that is closest to where the missing item should be.'),
  count: z.number().optional().describe('The total count of all occurrences related to the issue. For example, if 4 spelling mistakes are found, this should be 4.'),
  occurrences: z.array(z.string()).optional().describe('An array of exact, verbatim text snippets for each occurrence of the issue found in the document. This is used for highlighting all instances.'),
});

const AnalyzeSowDocumentInputSchema = z.object({
  sowDocument: z.string().describe('The full text content of the Statement of Work document.'),
  checks: z.array(SowCheckSchema).describe('An array of checks to perform on the document.'),
});
export type AnalyzeSowDocumentInput = z.infer<typeof AnalyzeSowDocumentInputSchema>;

const AnalyzeSowDocumentOutputSchema = z.array(IssueSchema);
export type AnalyzeSowDocumentOutput = z.infer<typeof AnalyzeSowDocumentOutputSchema>;

export async function analyzeSowDocument(input: AnalyzeSowDocumentInput): Promise<AnalyzeSowDocumentOutput> {
    // Strip HTML tags to provide a cleaner input for the LLM
    const strippedHtml = input.sowDocument.replace(/<[^>]*>?/gm, ' ');
    const result = await analyzeSowDocumentFlow({ ...input, sowDocument: strippedHtml });

    if (!result) return [];

    // Sort the results based on the original order of checks passed in
    const originalOrder = input.checks.map(c => c.id);
    return result.sort((a, b) => {
        return originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id);
    });
}

const prompt = ai.definePrompt({
  name: 'analyzeSowDocumentPrompt',
  input: { schema: AnalyzeSowDocumentInputSchema },
  output: { schema: AnalyzeSowDocumentOutputSchema },
  prompt: `You are an expert SOW (Statement of Work) auditor. Your task is to analyze the provided SOW document against a dynamic set of user-provided rules and return your findings as a structured JSON array.

For each rule, you must provide the same ID from the input check, a title, a status ('passed' or 'failed'), and a detailed description of the outcome.

**Crucially, you must also identify ALL occurrences of an issue.**
- occurrences: Provide an array of the EXACT, verbatim text snippets for every single instance of the issue.
- count: Provide the total number of occurrences found.
- relevantText: Provide the first occurrence as the main relevant text for initial focus.

If no specific text is relevant (e.g., a missing section), relevantText should contain a sentence from the document that is closest to where the missing item should be, occurrences should be an empty array, and count should be 0.

**Document to Analyze:**
\`\`\`
{{{sowDocument}}}
\`\`\`

**Rules to Enforce:**
{{#each checks}}
- **ID: "{{this.id}}", Title: "{{this.title}}"**
  - Logic: {{this.prompt}}
{{/each}}


Please provide the output as a JSON array of objects, strictly following the schema. For each check in the input, produce exactly one corresponding issue object in the output array.
`,
});

const analyzeSowDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeSowDocumentFlow',
    inputSchema: AnalyzeSowDocumentInputSchema,
    outputSchema: AnalyzeSowDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
