import { type SowCheck } from './sow-data';

const LOCAL_STORAGE_KEY = 'sowise_default_checks';

const initialChecks: SowCheck[] = [
  {
    id: 'check1',
    title: 'Duplicate Headings Check',
    prompt: 'Identify if any headings (like H1, H2, etc.) have the exact same text and appear more than once. If duplicates are found, list them and their counts. Otherwise, state that all headings are unique.',
  },
  {
    id: 'check2',
    title: 'Title Format Check',
    prompt: 'The main title must follow the format "SOW [Customer] - [Project]". State if the format is correct or not.',
  },
  {
    id: 'check3',
    title: 'Language Check (English Only)',
    prompt: 'The entire document must be in English. If non-English text is found, state that and provide the non-English snippet. Otherwise, confirm it\'s all in English.',
  },
  {
    id: 'check4',
    title: 'Role Breakdown Table Check',
    prompt: 'Check if a "Role Breakdown" section or table exists. State if the table is found or not.',
  },
  {
    id: 'check5',
    title: 'Fees Breakdown Table Validation',
    prompt: 'Check if a "Fees Breakdown" section or table exists. State if the fees section is found or not.',
  },
  {
    id: 'check6',
    title: 'Customer Name Usage Check',
    prompt: 'First, identify the customer name from the title (the part between "SOW" and "-"). Then, count how many times that exact name appears in the document. It should be exactly 2. State the customer name, how many times it appeared, and if the count is correct.',
  },
  {
    id: 'check7',
    title: 'Spelling, Grammar, & Formatting',
    prompt: 'Scan the document for spelling and grammar errors. Summarize the findings. If errors exist, list examples.',
  },
  {
    id: 'check8',
    title: 'SOW Start/End Date Check',
    prompt: 'Check for the presence of "Start Date" and "End Date". The start date must contain "Within 10 business days of signed and executed contract". Confirm if both dates are present and correctly formatted.',
  },
  {
    id: 'check9',
    title: 'Bullet Points Quality Check',
    prompt: 'Check if all bullet points start with an action verb. If any bullet points do not start with an action verb, list them. Otherwise, confirm they are all correct.',
  },
];

export function getDefaultChecks(): SowCheck[] {
    if (typeof window === 'undefined') {
        return initialChecks;
    }
    try {
        const storedChecks = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedChecks) {
            return JSON.parse(storedChecks);
        }
    } catch (error) {
        console.error("Failed to parse checks from localStorage", error);
    }
    return initialChecks;
}

export function saveDefaultChecks(checks: SowCheck[]): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checks));
    } catch (error) {
        console.error("Failed to save checks to localStorage", error);
    }
}
