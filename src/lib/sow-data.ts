export interface Issue {
  id: string;
  title: string;
  status: 'passed' | 'failed';
  description: string;
  relevantText: string;
}

export const initialDocText = `<h1>SOW Sutherland Global Services, Inc - Website Redesign</h1>

<h2>1. Project Overview</h2>
<p>This Statement of Work (SOW) outlines the project for a complete redesign of the <strong>Sutherland Global Services, Inc</strong> website.</p>

<h2>1. Project Overview</h2>
<p>This is a duplicate heading which should be flagged.</p>

<h2>2. Scope of Work</h2>
<ul>
    <li>Design and develop a new modern UI/UX.</li>
    <li>Develop a responsive front-end.</li>
    <li>Documentation of the new design system.</li>
    <li>Integration with existing backend services.</li>
</ul>

<h2>3. Role Breakdown</h2>
<p>A Role Breakdown table should be here, but is missing.</p>

<h2>4. Fees Breakdown</h2>
<p>Total Project Cost: $50,000. This should be a table organized by milestone. It also has a note in the wrong color.</p>

<h2>5. Timeline</h2>
<p><strong>Start Date:</strong> Within 10 business days of signed and executed contract</p>
<p><strong>End Date:</strong> December 31, 2024</p>

<h2>6. Language and Spelling</h2>
<p>This section has a speling mistake. The name Sutherland Global Services, Inc is used again. Este es un texto en español.</p>
`;

export const initialIssues: Issue[] = [
  {
    id: 'check1',
    title: 'Duplicate Headings Check',
    status: 'failed',
    description: "Headings should be unique. 'Project Overview' is used more than once.",
    relevantText: '1. Project Overview',
  },
  {
    id: 'check2',
    title: 'Title Format Check',
    status: 'passed',
    description: 'The SOW title follows the format: "SOW [Customer] - [Project]".',
    relevantText: 'SOW Sutherland Global Services, Inc - Website Redesign',
  },
  {
    id: 'check3',
    title: 'Language Check (English Only)',
    status: 'failed',
    description: 'Document contains non-English text.',
    relevantText: 'Este es un texto en español.',
  },
  {
    id: 'check4',
    title: 'Role Breakdown Table Check',
    status: 'failed',
    description: 'The Role Breakdown table is missing from the document.',
    relevantText: 'A Role Breakdown table should be here, but is missing.',
  },
  {
    id: 'check5',
    title: 'Fees Breakdown Table Validation',
    status: 'failed',
    description: 'Fees are not presented in a table organized by milestones.',
    relevantText: 'Total Project Cost: $50,000.',
  },
  {
    id: 'check6',
    title: 'Customer Name Usage Check',
    status: 'failed',
    description: 'The customer name "Sutherland Global Services, Inc" appears 3 times, but should only appear twice.',
    relevantText: 'Sutherland Global Services, Inc',
  },
  {
    id: 'check7',
    title: 'Spelling, Grammar, & Formatting',
    status: 'failed',
    description: 'Found spelling errors in the document.',
    relevantText: 'This section has a speling mistake.',
  },
  {
    id: 'check8',
    title: 'SOW Start/End Date Check',
    status: 'passed',
    description: 'Start date clause is present and end date is specified.',
    relevantText: 'Start Date: Within 10 business days of signed and executed contract',
  },
  {
    id: 'check9',
    title: 'Bullet Points Quality Check',
    status: 'failed',
    description: 'Bullet points should start with an action verb.',
    relevantText: 'Documentation of the new design system.',
  },
];
