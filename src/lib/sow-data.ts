export interface Issue {
  id: string;
  title: string;
  status: 'passed' | 'failed';
  description: string;
  relevantText: string;
}

export const initialDocText = `SOW ACME Corp - Website Redesign

1. Project Overview
This Statement of Work (SOW) outlines the project for a complete redesign of the ACME Corp website.

2. Scope of Work
- Design and develop a new modern UI/UX.
- Develop a responsive front-end.
- Documentation of the new design system.
- Integration with existing backend services.

3. Deliverables
- A fully functional and responsive website.
- Complete source code and assets.
- Technical documentation.
- All bullets must have a verb

4. Timeline
Project Start Date: Within 10 business days of SOW signing.
Project End Date: TBD

5. Fees
Total Project Cost: $50,000 USD
This should be a table.

6. Special Language
This section contains special handling language that needs validation.

7. Signatures
This document is a DRAFT.
`;

export const initialIssues: Issue[] = [
  {
    id: '1',
    title: 'Title Format Check',
    status: 'failed',
    description: "The SOW title should follow the format: SOW [Customer] - [Project]. The current title is 'SOW ACME Corp - Website Redesign'.",
    relevantText: 'SOW ACME Corp - Website Redesign',
  },
  {
    id: '2',
    title: 'Bullet Points Quality Check',
    status: 'failed',
    description: "One or more bullet points may be missing an action verb at the beginning.",
    relevantText: '- Documentation of the new design system.',
  },
  {
    id: '3',
    title: 'Fees Breakdown Table Check',
    status: 'failed',
    description: 'Fees section should be presented in a table format for clarity.',
    relevantText: 'Total Project Cost: $50,000 USD',
  },
  {
    id: '4',
    title: '[DRAFT] Tag Check',
    status: 'passed',
    description: 'The document correctly contains a DRAFT tag.',
    relevantText: 'This document is a DRAFT.',
  },
  {
    id: '5',
    title: 'Start/End Date Check',
    status: 'passed',
    description: 'SOW start date clause "Within 10 business days..." is present.',
    relevantText: 'Within 10 business days of SOW signing',
  },
  {
    id: '6',
    title: 'Special Handling Language',
    status: 'failed',
    description: 'The special handling language section needs to be validated against compliance rules.',
    relevantText: 'This section contains special handling language that needs validation.',
  },
];
