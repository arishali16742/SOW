'use server';
/**
 * @fileOverview An AI agent that analyzes SOW documents against a set of rules.
 *
 * - analyzeSowDocument - A function that handles the SOW analysis process.
 * - AnalyzeSowDocumentInput - The input type for the analyzeSowDocument function.
 * - AnalyzeSowDocumentOutput - The return type for the analyzeSowDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the Zod schema for an individual issue, mirroring the `Issue` interface.
const IssueSchema = z.object({
  id: z.string().describe('A unique identifier for the check (e.g., "check1", "check2").'),
  title: z.string().describe('The title of the check being performed.'),
  status: z.enum(['passed', 'failed']).describe('The status of the check.'),
  description: z.string().describe('A detailed description of the finding. Explains why it passed or failed.'),
  relevantText: z.string().describe('The EXACT, verbatim text snippet from the document that is relevant to this issue. This text will be used for highlighting. If no specific text is relevant (e.g., a missing section), provide a sentence from the document that is closest to where the missing item should be.'),
});

const AnalyzeSowDocumentInputSchema = z.object({
  sowDocument: z.string().describe('The full text content of the Statement of Work document.'),
});
export type AnalyzeSowDocumentInput = z.infer<typeof AnalyzeSowDocumentInputSchema>;

const AnalyzeSowDocumentOutputSchema = z.array(IssueSchema);
export type AnalyzeSowDocumentOutput = z.infer<typeof AnalyzeSowDocumentOutputSchema>;

export async function analyzeSowDocument(input: AnalyzeSowDocumentInput): Promise<AnalyzeSowDocumentOutput> {
    // Strip HTML tags to provide a cleaner input for the LLM
    const strippedHtml = input.sowDocument.replace(/<[^>]*>?/gm, ' ');
    const result = await analyzeSowDocumentFlow({ sowDocument: strippedHtml });

    if (!result) return [];

    // Sort the results by ID to ensure a consistent order in the UI
    return result.sort((a, b) => {
        const idA = parseInt(a.id.replace('check', ''));
        const idB = parseInt(b.id.replace('check', ''));
        return idA - idB;
    });
}

const prompt = ai.definePrompt({
  name: 'analyzeSowDocumentPrompt',
  input: { schema: AnalyzeSowDocumentInputSchema },
  output: { schema: AnalyzeSowDocumentOutputSchema },
  prompt: `You are an expert SOW (Statement of Work) auditor. Your task is to analyze the provided SOW document against a predefined set of rules and return your findings as a structured JSON array.

For each rule, you must provide a unique ID, a title, a status ('passed' or 'failed'), a detailed description of the outcome, and the EXACT relevant text from the document that justifies your finding. This text MUST be a direct, verbatim quote from the document.

**Document to Analyze:**
\`\`\`
{{{sowDocument}}}
\`\`\`

**Rules to Enforce:**

1.  **Duplicate Headings Check:**
    -   ID: "check1", Title: "Duplicate Headings Check"
    -   Logic: Identify if any headings (like H1, H2, etc.) have the exact same text and appear more than once.
    -   Description: If duplicates are found, list them and their counts. Otherwise, state that all headings are unique.
    -   Relevant Text: The first occurrence of a duplicated heading. If none, use the main document title.

2.  **Title Format Check:**
    -   ID: "check2", Title: "Title Format Check"
    -   Logic: The main title must follow the format "SOW [Customer] - [Project]".
    -   Description: State if the format is correct or not.
    -   Relevant Text: The document title itself.

3.  **Language Check (English Only):**
    -   ID: "check3", Title: "Language Check (English Only)"
    -   Logic: The entire document must be in English.
    -   Description: If non-English text is found, state that and provide the non-English snippet. Otherwise, confirm it's all in English.
    -   Relevant Text: The first snippet of non-English text found. If none, use the main document title.

4.  **Role Breakdown Table Check:**
    -   ID: "check4", Title: "Role Breakdown Table Check"
    -   Logic: Check if a "Role Breakdown" section or table exists.
    -   Description: State if the table is found or not.
    -   Relevant Text: The heading "Role Breakdown" if it exists, or a sentence nearby indicating its absence.

5.  **Fees Breakdown Table Validation:**
    -   ID: "check5", Title: "Fees Breakdown Table Validation"
    -   Logic: Check if a "Fees Breakdown" section or table exists.
    -   Description: State if the fees section is found or not.
    -   Relevant Text: The heading "Fees Breakdown" if it exists, or a sentence nearby indicating its absence.

6.  **Customer Name Usage Check:**
    -   ID: "check6", Title: "Customer Name Usage Check"
    -   Logic: First, identify the customer name from the title (the part between "SOW" and "-"). Then, count how many times that exact name appears in the document. It should be exactly 2.
    -   Description: State the customer name, how many times it appeared, and if the count is correct. If it's incorrect, list the extra occurrences.
    -   Relevant Text: The first occurrence of the customer name in the document.

7.  **Spelling, Grammar, & Formatting:**
    -   ID: "check7", Title: "Spelling, Grammar, & Formatting"
    -   Logic: Scan the document for spelling and grammar errors.
    -   Description: Summarize the findings. If errors exist, list examples.
    -   Relevant Text: The first sentence containing a spelling or grammar error. If none, use the main document title.

8.  **SOW Start/End Date Check:**
    -   ID: "check8", Title: "SOW Start/End Date Check"
    -   Logic: Check for the presence of "Start Date" and "End Date". The start date must contain "Within 10 business days of signed and executed contract".
    -   Description: Confirm if both dates are present and correctly formatted. Specify what's wrong if they are not.
    -   Relevant Text: The sentence or line containing the start date.

9.  **Bullet Points Quality Check:**
    -   ID: "check9", Title: "Bullet Points Quality Check"
    -   Logic: Check if all bullet points start with an action verb.
    -   Description: If any bullet points do not start with an action verb, list them. Otherwise, confirm they are all correct.
    -   Relevant Text: The first bullet point that does not start with an action verb. If all are correct, use the first bullet point in the document.

Please provide the output as a JSON array of objects, strictly following the schema.
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
