require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const DiscoverItem = require('../models/DiscoverItem');

const ITEMS = [
  {
    lab: 'Google DeepMind',
    title: 'Gemini 2.5 Pro sets new reasoning benchmark',
    summary: 'DeepMind\'s Gemini 2.5 Pro achieves state-of-the-art scores on MMLU, MATH, and HumanEval, outperforming all prior multimodal models in structured reasoning tasks.',
    publishDate: new Date('2026-03-26'),
  },
  {
    lab: 'MIT CSAIL',
    title: 'Sparse attention cuts inference cost by 60 %',
    summary: 'Researchers at MIT\'s CSAIL lab published a sparse attention kernel that reduces transformer inference memory by 60 % with under 1 % accuracy loss on standard NLP benchmarks.',
    publishDate: new Date('2026-03-22'),
  },
  {
    lab: 'Anthropic',
    title: 'Constitutional AI v2 improves alignment at scale',
    summary: 'Anthropic\'s updated Constitutional AI framework introduces automated red-teaming loops, reducing harmful output rates by 40 % compared to the original CAI pipeline.',
    publishDate: new Date('2026-03-18'),
  },
  {
    lab: 'Nexus AI',
    title: 'NexusAI-DB recommendation engine goes open-source',
    summary: 'The adaptive weighting algorithm behind NexusAI-DB is now open-source under the MIT licence, enabling developers to embed capability-aware model selection into any application.',
    publishDate: new Date('2026-03-15'),
  },
  {
    lab: 'Stanford NLP',
    title: 'HELM 2.0 expands multi-language evaluation suite',
    summary: 'Stanford NLP\'s Holistic Evaluation of Language Models now covers 42 languages and 120 benchmarks, providing the most comprehensive cross-lingual LLM assessment to date.',
    publishDate: new Date('2026-03-10'),
  },
  {
    lab: 'DeepSeek',
    title: 'DeepSeek-R2 matches GPT-5 on code generation',
    summary: 'DeepSeek\'s R2 model, trained with reinforcement learning from execution feedback, achieves parity with GPT-5 on competitive programming benchmarks at a fraction of the compute cost.',
    publishDate: new Date('2026-02-05'),
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const item of ITEMS) {
    await DiscoverItem.findOneAndUpdate({ title: item.title }, item, { upsert: true, new: true });
    console.log(`  Upserted: ${item.title}`);
  }

  console.log('Discover seeding complete.');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
