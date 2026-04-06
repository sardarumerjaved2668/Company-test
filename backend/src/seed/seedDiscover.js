require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const DiscoverItem = require('../models/DiscoverItem');

const M = (name) => ({ name, icon: 'robot' });

/** Anchor dates to “today” so papersThisWeek and filters always match real clocks. */
function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

const ITEMS = [
  {
    lab: 'Google DeepMind',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    summary:
      'Scores 82.3% on AIME 2025 math competition, outperforming prior models on reasoning-intensive tasks with iterative thought refinement and stable chain-of-thought.',
    publishDate: daysAgo(0),
    category: 'reasoning',
    arxivId: '2603.08821',
    arxivUrl: 'https://arxiv.org/abs/2603.08821',
    authors: ['Anil, R.', 'Borgeaud, S.', 'Wu, Y.', 'et al.'],
    keyFindings: [
      'New Iterative Thought Refinement (ITR) allows real-time reasoning backtracking without full re-generation of long chains.',
      'MATH Level 5 and AIME 2025 gains come primarily from improved calibration on multi-step derivations rather than raw parameter scale.',
      'Long-horizon tool-use benchmarks show fewer failure cascades when paired with a lightweight verifier head.',
      'Latency-aware routing maintains quality while cutting median tokens per answer by 12% vs the prior Gemini 2.0 stack.',
    ],
    modelsReferenced: [
      M('Gemini 2.5 Pro'),
      M('GPT-5'),
      M('Claude Opus 4.6'),
      M('o3'),
    ],
    impactLevel: 'High',
    impactDescription: 'sets new benchmark baseline for all future frontier model evaluations.',
    citation:
      'Anil, R., Borgeaud, S., Wu, Y., et al. (2026). Gemini 2.5 Pro: Reasoning at Scale. arXiv preprint arXiv:2603.08821.',
  },
  {
    lab: 'Meta AI',
    title: 'Llama 4 Scout & Maverick: natively multimodal from the ground up',
    summary:
      '17B MoE architecture trained on 40 trillion tokens with native understanding across text, images, and audio in a unified tokenizer space.',
    publishDate: daysAgo(1),
    category: 'multimodal',
    arxivId: '2603.08812',
    arxivUrl: 'https://arxiv.org/abs/2603.08812',
    authors: ['L. Rodriguez', 'K. Kim', 'J. Weber'],
    keyFindings: [
      'Image-text retrieval on COCO-Text + Video outperforms prior Llama 3.2 vision variants by 9% nDCG.',
      'Audio captioning F1 improves 11 points vs separate speech + text pipelines.',
      'MoE routing remains stable across modalities with under 2% expert collapse rate.',
      'Inference cost held flat vs dense 70B by activating ~12B parameters per token on average.',
    ],
    modelsReferenced: [M('Llama 4 Scout'), M('Llama 4 Maverick'), M('Qwen2.5-VL'), M('Gemini 2.5')],
    impactLevel: 'Medium',
    impactDescription: 'strong signal that native multimodal pretraining beats late fusion for mixed-media agents.',
    citation:
      'Rodriguez, L., Kim, K., Weber, J. (2026). Llama 4 Multimodal MoE. arXiv preprint arXiv:2603.08812.',
  },
  {
    lab: 'Anthropic',
    title: 'Constitutional AI v2: iterative refinement for scalable alignment',
    summary:
      'Automated critique loops and preference models reduce harmful outputs by 40% while preserving benchmark capability.',
    publishDate: daysAgo(2),
    category: 'alignment',
    arxivId: '2603.07144',
    arxivUrl: 'https://arxiv.org/abs/2603.07144',
    authors: ['R. Shah', 'E. Martinez', 'T. Nguyen'],
    keyFindings: [
      'Harmful completion rate on internal red-team suite drops from 2.1% to 1.2%.',
      'No regression on MMLU-Pro or GPQA when CAI v2 is applied post-training.',
      'Human preference win-rate vs baseline Claude improves by 7% on policy-sensitive prompts.',
      'Training compute overhead stays under +8% vs single-pass RLHF.',
    ],
    modelsReferenced: [M('Claude Opus 4'), M('Claude Sonnet 4'), M('Claude 3.7')],
    impactLevel: 'High',
    impactDescription: 'practical path to safer deployments without freezing capability growth.',
    citation:
      'Shah, R., Martinez, E., Nguyen, T. (2026). Constitutional AI v2. arXiv preprint arXiv:2603.07144.',
  },
  {
    lab: 'MIT CSAIL',
    title: 'Sparse attention cuts inference memory by 60% with <1% accuracy loss',
    summary:
      'Hardware-aware sparse kernels for long-context transformers reduce peak memory and unlock longer batches on the same GPU tier.',
    publishDate: daysAgo(3),
    category: 'efficiency',
    arxivId: '2603.05501',
    arxivUrl: 'https://arxiv.org/abs/2603.05501',
    authors: ['Y. Liu', 'H. Frost'],
    keyFindings: [
      'Block-sparse pattern learned from calibration data generalizes across seven open LLM families.',
      '128K context on A100 40GB becomes feasible for 7B models at batch size 4.',
      'End-to-end latency improves 22% vs dense flash-attention at 64K tokens.',
      'Accuracy delta on LongBench: −0.4 to −0.9 points depending on model family.',
    ],
    modelsReferenced: [M('Llama 3.1 8B'), M('Mistral Small'), M('Qwen2.5 7B')],
    impactLevel: 'Medium',
    impactDescription: 'immediate wins for on-prem and edge deployments with memory constraints.',
    citation:
      'Liu, Y., Frost, H. (2026). Learned Sparse Attention for Transformers. arXiv preprint arXiv:2603.05501.',
  },
  {
    lab: 'DeepSeek',
    title: 'DeepSeek-R2 open weights: frontier code RL at minimal cost',
    summary:
      'Full weight release with RL from execution feedback matches GPT-5-class models on LiveCodeBench at a fraction of compute.',
    publishDate: daysAgo(4),
    category: 'open_weights',
    arxivId: '2603.04022',
    arxivUrl: 'https://arxiv.org/abs/2603.04022',
    authors: ['DeepSeek Team'],
    keyFindings: [
      'Pass@1 on LiveCodeBench v5 reaches 41.2% vs 39.8% for prior closed frontier.',
      'Training recipe and data filters published alongside the 671B MoE checkpoint.',
      'Fine-tuning on domain repositories yields +15% on internal enterprise benchmarks.',
      'Inference cost estimated at one quarter of API pricing for comparable quality tiers.',
    ],
    modelsReferenced: [M('DeepSeek-R2'), M('GPT-5'), M('Gemini 2.5 Pro')],
    impactLevel: 'High',
    impactDescription: 'accelerates reproducibility and local fine-tuning for regulated industries.',
    citation:
      'DeepSeek Team (2026). DeepSeek-R2: Execution-Grounded Code RL. arXiv preprint arXiv:2603.04022.',
  },
  {
    lab: 'Mistral AI',
    title: 'Mistral Small 3.2: Apache 2.0 weights for on-device agents',
    summary:
      '24B dense model with competitive MMLU and tool-use scores, optimised for CPU/GPU laptops and edge boxes.',
    publishDate: daysAgo(5),
    category: 'open_weights',
    arxivId: '2603.04088',
    arxivUrl: 'https://arxiv.org/abs/2603.04088',
    authors: ['A. Dubois', 'L. Martin'],
    keyFindings: [
      'Matches GPT-4o-mini class on GSM8K with 4-bit quantisation on consumer GPUs.',
      'Apache 2.0 licence allows commercial redistribution without attribution beyond the licence text.',
      'Bundled tokenizer and chat template align with OpenAI-compatible chat APIs.',
      'Latency under 80ms on M-series laptops for 512-token prompts.',
    ],
    modelsReferenced: [M('Mistral Small 3.2'), M('Llama 3.1 8B')],
    impactLevel: 'Medium',
    impactDescription: 'expands open-weight deployment to laptops and regulated air-gapped environments.',
    citation:
      'Dubois, A., Martin, L. (2026). Mistral Small 3.2: Edge-Ready Open Weights. arXiv preprint arXiv:2603.04088.',
  },
  {
    lab: 'Stanford NLP',
    title: 'HELM 2.0: 42 languages and 120 benchmarks for holistic LLM eval',
    summary:
      'Expanded multilingual suite surfaces capability gaps Western-centric benchmarks miss.',
    publishDate: daysAgo(6),
    category: 'alignment',
    arxivId: '2603.02890',
    arxivUrl: 'https://arxiv.org/abs/2603.02890',
    authors: ['J. Liang', 'P. Dubois', 'C. Singh'],
    keyFindings: [
      'Top-five global models drop 8–14 points on average when evaluated on non-English primary tasks.',
      'New toxicity and bias probes cover twelve scripts and right-to-left languages.',
      'Leaderboard API exposes per-benchmark confidence intervals.',
      'Community submissions increased threefold vs HELM 1.0 in the pilot month.',
    ],
    modelsReferenced: [M('GPT-5'), M('Gemini 2.5'), M('Claude Opus 4'), M('Llama 4')],
    impactLevel: 'Medium',
    impactDescription: 'shifts industry focus toward equitable multilingual measurement.',
    citation:
      'Liang, J., Dubois, P., Singh, C. (2026). HELM 2.0 Multilingual. arXiv preprint arXiv:2603.02890.',
  },
  {
    lab: 'Nexus AI',
    title: 'NexusAI-DB: adaptive weighting for capability-aware routing',
    summary:
      'Open-sourced scoring across seven dimensions helps teams pick models without manual spreadsheets.',
    publishDate: daysAgo(14),
    category: 'efficiency',
    arxivId: '2603.01005',
    arxivUrl: 'https://arxiv.org/abs/2603.01005',
    authors: ['Nexus AI Research'],
    keyFindings: [
      'Keyword plus weighted dimensions recover human expert top-three picks in 89% of blind tests.',
      'Domain bonuses for vision and audio reduce text-model bias in recommendations.',
      'Latency and cost constraints fold into a single ranking pass.',
      'MIT-licensed reference implementation ships with seed data for twenty-plus models.',
    ],
    modelsReferenced: [M('NexusAI-DB'), M('Various frontier APIs')],
    impactLevel: 'Medium',
    impactDescription: 'tooling layer that improves decision quality for builders.',
    citation:
      'Nexus AI Research (2026). Adaptive Model Recommendation with Multi-Dimensional Scoring. arXiv preprint arXiv:2603.01005.',
  },
  {
    lab: 'Alibaba Qwen Team',
    title: 'Qwen3-Max: scaling multimodal alignment with synthetic curricula',
    summary:
      'Synthetic preference data and vision-language co-training lift open-vocabulary grounding.',
    publishDate: daysAgo(21),
    category: 'multimodal',
    arxivId: '2602.99100',
    arxivUrl: 'https://arxiv.org/abs/2602.99100',
    authors: ['W. Zhang', 'L. Huang'],
    keyFindings: [
      'RefCOCOg accuracy gains 4.1 points vs Qwen2.5-VL at similar compute.',
      'Synthetic RLHF pairs reduce human annotation hours by 62% for vision tasks.',
      'Safety refusal rates improve without hurting creative writing scores.',
      'Released 8B and 72B instruct variants under Apache-2.0.',
    ],
    modelsReferenced: [M('Qwen3-Max'), M('Qwen2.5-VL'), M('Gemini 2.0 Flash')],
    impactLevel: 'Medium',
    impactDescription: 'strong open multimodal option for APAC-first product teams.',
    citation:
      'Zhang, W., Huang, L. (2026). Qwen3-Max Multimodal Alignment. arXiv preprint arXiv:2602.99100.',
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const item of ITEMS) {
    await DiscoverItem.findOneAndUpdate({ title: item.title }, item, { upsert: true, new: true });
    console.log(`  Upserted: ${item.title}`);
  }

  console.log('Discover seeding complete.');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
