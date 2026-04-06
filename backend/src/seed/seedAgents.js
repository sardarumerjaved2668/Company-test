require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Agent = require('../models/Agent');

const AGENTS = [
  {
    templateId: 'research',
    title: 'Research Assistant',
    description: 'Automates deep research tasks, summarises papers, and surfaces key insights from large document sets.',
    model: 'GPT-4o',
    tags: ['Research', 'Summarisation', 'Analysis'],
    icon: '🔬',
  },
  {
    templateId: 'support',
    title: 'Customer Support',
    description: 'Handles customer queries, escalates complex issues, and drafts empathetic, on-brand responses 24/7.',
    model: 'Claude 3.5 Sonnet',
    tags: ['Support', 'Customer Service', 'Automation'],
    icon: '🎧',
  },
  {
    templateId: 'review',
    title: 'Code Reviewer',
    description: 'Reviews pull requests for bugs, style violations, and security issues, then suggests targeted fixes.',
    model: 'Claude 3.5 Sonnet',
    tags: ['Code', 'Review', 'Security'],
    icon: '🔍',
  },
  {
    templateId: 'analysis',
    title: 'Data Analyst',
    description: 'Ingests structured data, identifies trends and anomalies, and generates executive-ready reports.',
    model: 'Gemini 1.5 Pro',
    tags: ['Data', 'Analytics', 'Reporting'],
    icon: '📊',
  },
  {
    templateId: 'content',
    title: 'Content Creator',
    description: 'Generates SEO-optimised blog posts, social captions, and email campaigns tuned to your brand voice.',
    model: 'GPT-4o',
    tags: ['Writing', 'Marketing', 'SEO'],
    icon: '✍️',
  },
  {
    templateId: 'sales',
    title: 'Sales Copilot',
    description: 'Drafts outreach, handles objections, and enriches leads using your CRM context.',
    model: 'GPT-4 Turbo',
    tags: ['Sales', 'CRM', 'Outreach'],
    icon: '💼',
  },
  {
    templateId: 'legal',
    title: 'Contract Helper',
    description: 'Summarises clauses, flags risks, and suggests redlines — not legal advice.',
    model: 'Claude 3 Opus',
    tags: ['Legal', 'Compliance', 'Documents'],
    icon: '⚖️',
  },
  {
    templateId: 'devops',
    title: 'DevOps Helper',
    description: 'Generates Terraform snippets, CI checks, and incident runbooks from natural language.',
    model: 'Llama 3.1 70B',
    tags: ['DevOps', 'Infra', 'CI/CD'],
    icon: '🛠',
  },
  {
    templateId: 'translator',
    title: 'Translation Agent',
    description: 'High-quality multilingual translation with glossary and tone control.',
    model: 'Mistral Large 2',
    tags: ['Translation', 'Multilingual'],
    icon: '🌐',
  },
  {
    templateId: 'image',
    title: 'Creative Director',
    description: 'Iterates on prompts for image generation and brand-consistent visuals.',
    model: 'DALL·E 3',
    tags: ['Image', 'Creative', 'Branding'],
    icon: '🎨',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const agent of AGENTS) {
    await Agent.findOneAndUpdate(
      { templateId: agent.templateId },
      { ...agent, isSystem: true },
      { upsert: true, new: true }
    );
    console.log(`  Upserted agent: ${agent.title}`);
  }

  console.log(`Agent seeding complete (${AGENTS.length} templates).`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
