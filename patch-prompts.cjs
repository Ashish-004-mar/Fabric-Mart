const fs = require('fs');
let content = fs.readFileSync('server/src/ai/prompt-templates.ts', 'utf8');

const replacement = `
import { FAQs } from './faqs.js';

export function buildSupportPrompt(role: 'BUYER' | 'SUPPLIER', query: string, orderContext: any) {
  return \`User Role: \${role}

Active Orders / Account Context:
\${JSON.stringify(orderContext || {}, null, 2)}

Knowledge Base (FAQs):
\${JSON.stringify(FAQs, null, 2)}

User Voice Query:
"\${query}"

Respond as Fabric Mart Voice Agent in 2-4 short, clear spoken sentences for voice output.\`;
}
`;

content = content.replace(/export function buildSupportPrompt[\s\S]*$/, replacement.trim());

fs.writeFileSync('server/src/ai/prompt-templates.ts', content);
