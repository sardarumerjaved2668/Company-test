// NexusAI-DB — Recommendation Engine Tests
// Agent: Testing | Run: node src/tests/recommendation.test.js

const { getRecommendations, detectIntent } = require('../utils/recommendation');

// Inline model data (no DB needed)
const MODELS = [
  { slug:'gpt-4o', name:'GPT-4o', provider:'OpenAI', categories:['Text Generation','Multimodal','Code','Reasoning','Chat'], description:'OpenAI flagship multimodal model.', pricing:{tier:'mid',input:2.5}, strengths:['Multimodal','Fast'], limitations:['Cost'], scores:{reasoning:95,coding:90,creativity:88,speed:85,multimodal:97,contextHandling:90,costEfficiency:72}, openSource:false },
  { slug:'claude-3-5-sonnet', name:'Claude 3.5 Sonnet', provider:'Anthropic', categories:['Text Generation','Reasoning','Code','Chat','Analysis'], description:'Best coding model.', pricing:{tier:'mid',input:3.0}, strengths:['Top coding','200K context'], limitations:['No image gen'], scores:{reasoning:97,coding:98,creativity:90,speed:78,multimodal:75,contextHandling:98,costEfficiency:68}, openSource:false },
  { slug:'gemini-1-5-pro', name:'Gemini 1.5 Pro', provider:'Google', categories:['Text Generation','Multimodal','Code','Reasoning','Research'], description:'1M context window.', pricing:{tier:'mid',input:3.5}, strengths:['1M context','Video'], limitations:['Pricing'], scores:{reasoning:92,coding:85,creativity:84,speed:75,multimodal:95,contextHandling:100,costEfficiency:70}, openSource:false },
  { slug:'dalle-3', name:'DALL·E 3', provider:'OpenAI', categories:['Image Generation','Creative','Multimodal'], description:'Image generation.', pricing:{tier:'mid',input:0.04}, strengths:['Prompt adherence','Photorealistic'], limitations:['Per-image pricing'], scores:{reasoning:0,coding:0,creativity:93,speed:72,multimodal:95,contextHandling:0,costEfficiency:65}, openSource:false },
  { slug:'midjourney-v6', name:'Midjourney V6', provider:'Midjourney', categories:['Image Generation','Creative','Art'], description:'Artistic images.', pricing:{tier:'mid',input:10}, strengths:['Artistic quality'], limitations:['No API'], scores:{reasoning:0,coding:0,creativity:98,speed:68,multimodal:88,contextHandling:0,costEfficiency:60}, openSource:false },
  { slug:'whisper', name:'Whisper', provider:'OpenAI', categories:['Audio','Speech-to-Text','Transcription','Translation'], description:'Speech recognition.', pricing:{tier:'budget',input:0.006}, strengths:['99 languages','Near-human accuracy'], limitations:['No diarization'], scores:{reasoning:0,coding:0,creativity:30,speed:78,multimodal:80,contextHandling:0,costEfficiency:95}, openSource:true },
  { slug:'stable-diffusion-xl', name:'Stable Diffusion XL', provider:'Stability AI', categories:['Image Generation','Creative','Open Source'], description:'Open source image gen.', pricing:{tier:'free',input:0}, strengths:['Open source','Local run'], limitations:['Needs GPU'], scores:{reasoning:0,coding:0,creativity:88,speed:65,multimodal:90,contextHandling:0,costEfficiency:100}, openSource:true },
  { slug:'gemma-2', name:'Gemma 2', provider:'Google', categories:['Text Generation','Code','Chat','Open Source'], description:'Lightweight open model.', pricing:{tier:'free',input:0}, strengths:['Open weights','Local'], limitations:['Small context'], scores:{reasoning:74,coding:73,creativity:70,speed:90,multimodal:20,contextHandling:45,costEfficiency:100}, openSource:true },
  { slug:'phi-3-mini', name:'Phi-3 Mini', provider:'Microsoft', categories:['Text Generation','Code','Open Source','Speed'], description:'Edge model.', pricing:{tier:'free',input:0}, strengths:['Edge deployment'], limitations:['Less capable'], scores:{reasoning:70,coding:76,creativity:60,speed:99,multimodal:0,contextHandling:85,costEfficiency:100}, openSource:true },
  { slug:'llama-3-1-405b', name:'Llama 3.1 405B', provider:'Meta', categories:['Text Generation','Reasoning','Code','Research'], description:'Large open-source model.', pricing:{tier:'mid',input:3.0}, strengths:['Open source','Fine-tunable'], limitations:['High compute'], scores:{reasoning:89,coding:86,creativity:82,speed:60,multimodal:40,contextHandling:88,costEfficiency:80}, openSource:true },
  { slug:'gpt-3-5-turbo', name:'GPT-3.5 Turbo', provider:'OpenAI', categories:['Text Generation','Chat','Code'], description:'Fast cheap model.', pricing:{tier:'budget',input:0.5}, strengths:['Very cheap','Fast'], limitations:['Older'], scores:{reasoning:68,coding:70,creativity:65,speed:95,multimodal:0,contextHandling:55,costEfficiency:95}, openSource:false },
  { slug:'claude-3-haiku', name:'Claude 3 Haiku', provider:'Anthropic', categories:['Text Generation','Chat','Code','Speed'], description:'Fast Claude model.', pricing:{tier:'budget',input:0.25}, strengths:['Very fast','Affordable'], limitations:['Less capable'], scores:{reasoning:72,coding:74,creativity:68,speed:98,multimodal:70,contextHandling:90,costEfficiency:97}, openSource:false },
  { slug:'gemini-1-5-flash', name:'Gemini 1.5 Flash', provider:'Google', categories:['Text Generation','Multimodal','Chat','Speed'], description:'Fast Google model.', pricing:{tier:'budget',input:0.075}, strengths:['Very cheap','1M context'], limitations:['Less accurate'], scores:{reasoning:78,coding:75,creativity:72,speed:93,multimodal:85,contextHandling:100,costEfficiency:98}, openSource:false },
  { slug:'command-r-plus', name:'Command R+', provider:'Cohere', categories:['Text Generation','Reasoning','RAG','Enterprise'], description:'Enterprise RAG model.', pricing:{tier:'mid',input:3.0}, strengths:['RAG optimized'], limitations:['Less known'], scores:{reasoning:83,coding:78,creativity:70,speed:80,multimodal:0,contextHandling:88,costEfficiency:72}, openSource:false },
  { slug:'gpt-4o-mini', name:'GPT-4o Mini', provider:'OpenAI', categories:['Text Generation','Chat','Code','Speed'], description:'Affordable multimodal.', pricing:{tier:'budget',input:0.15}, strengths:['Affordable','Multimodal'], limitations:['Less capable'], scores:{reasoning:78,coding:80,creativity:74,speed:92,multimodal:82,contextHandling:88,costEfficiency:93}, openSource:false },
  { slug:'gpt-4-turbo', name:'GPT-4 Turbo', provider:'OpenAI', categories:['Text Generation','Reasoning','Code','Chat'], description:'Powerful GPT-4 variant.', pricing:{tier:'premium',input:10.0}, strengths:['Deep reasoning','Vision'], limitations:['Expensive','Slower'], scores:{reasoning:93,coding:88,creativity:85,speed:68,multimodal:80,contextHandling:90,costEfficiency:50}, openSource:false },
  { slug:'claude-3-opus', name:'Claude 3 Opus', provider:'Anthropic', categories:['Text Generation','Reasoning','Research','Analysis'], description:'Most powerful Claude.', pricing:{tier:'premium',input:15.0}, strengths:['Graduate reasoning'], limitations:['Expensive'], scores:{reasoning:99,coding:88,creativity:95,speed:55,multimodal:72,contextHandling:98,costEfficiency:30}, openSource:false },
  { slug:'gemini-ultra', name:'Gemini Ultra', provider:'Google', categories:['Text Generation','Multimodal','Reasoning','Research'], description:'MMLU leader.', pricing:{tier:'premium',input:20.0}, strengths:['MMLU SOTA'], limitations:['Very expensive'], scores:{reasoning:96,coding:87,creativity:86,speed:60,multimodal:96,contextHandling:70,costEfficiency:25}, openSource:false },
  { slug:'mistral-large', name:'Mistral Large', provider:'Mistral AI', categories:['Text Generation','Reasoning','Code','Multilingual'], description:'Multilingual Mistral.', pricing:{tier:'mid',input:3.0}, strengths:['Multilingual'], limitations:['No image'], scores:{reasoning:85,coding:82,creativity:78,speed:80,multimodal:0,contextHandling:85,costEfficiency:75}, openSource:false },
  { slug:'llama-3-1-70b', name:'Llama 3.1 70B', provider:'Meta', categories:['Text Generation','Code','Chat','Reasoning'], description:'Open mid model.', pricing:{tier:'budget',input:0.59}, strengths:['Open source','Multilingual'], limitations:['No vision'], scores:{reasoning:80,coding:78,creativity:75,speed:78,multimodal:0,contextHandling:85,costEfficiency:90}, openSource:true },
];

// ── Test runner ──────────────────────────────────────────────
let passed = 0; let failed = 0; const failures = [];
function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.log(`  ✗ ${name}\n    → ${e.message}`); failed++; failures.push({ name, error: e.message }); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEqual(a, b, m) { if (a !== b) throw new Error(m || `Expected ${b}, got ${a}`); }
function assertInRange(v, min, max, m) { if (v < min || v > max) throw new Error(m || `${v} not in [${min}, ${max}]`); }

// ── DATA LAYER ───────────────────────────────────────────────
console.log('\n[DATA LAYER]');
test('Has 20+ models', () => assert(MODELS.length >= 20, `Got ${MODELS.length}`));
test('All models have required fields', () => {
  for (const m of MODELS)
    for (const f of ['slug','name','provider','categories','description','scores','pricing'])
      assert(m[f] !== undefined, `Model '${m.slug}' missing '${f}'`);
});
test('All 7 score dimensions in [0,100]', () => {
  for (const m of MODELS)
    for (const d of ['reasoning','coding','creativity','speed','multimodal','contextHandling','costEfficiency']) {
      assert(m.scores[d] !== undefined, `'${m.slug}' missing score '${d}'`);
      assertInRange(m.scores[d], 0, 100, `'${m.slug}'.${d} = ${m.scores[d]}`);
    }
});
test('All models have ≥1 category', () => { for (const m of MODELS) assert(m.categories.length > 0, `'${m.slug}' has no categories`); });
test('All models have ≥1 strength', () => { for (const m of MODELS) assert(m.strengths.length > 0, `'${m.slug}' has no strengths`); });
test('All models have ≥1 limitation', () => { for (const m of MODELS) assert(m.limitations.length > 0, `'${m.slug}' has no limitations`); });
test('Slugs are unique', () => { const s = new Set(MODELS.map((m) => m.slug)); assertEqual(s.size, MODELS.length, 'Duplicate slugs'); });
test('Pricing tiers are valid', () => { for (const m of MODELS) assert(['free','budget','mid','premium'].includes(m.pricing.tier), `'${m.slug}' bad tier: ${m.pricing.tier}`); });

// ── INTENT DETECTION ─────────────────────────────────────────
console.log('\n[INTENT DETECTION]');
test('Detects coding from "write python code"', () => assert(detectIntent('write python code').signals.coding > 0));
test('Detects reasoning from "analyze complex research"', () => assert(detectIntent('analyze complex research').signals.reasoning > 0));
test('Detects creativity from "write creative stories"', () => assert(detectIntent('write creative stories').signals.creativity > 0));
test('Detects speed from "fast realtime responses"', () => assert(detectIntent('fast realtime responses').signals.speed > 0));
test('Detects multimodal from "analyze images and video"', () => assert(detectIntent('analyze images and video').signals.multimodal > 0));
test('Detects cost from "cheap open source local"', () => assert(detectIntent('cheap open source local').signals.costEfficiency > 0));
test('Detects Image Generation category', () => assert(detectIntent('generate images and illustrations').detectedCategories.includes('Image Generation')));
test('Detects Audio category from transcription', () => assert(detectIntent('transcribe audio recordings to text').detectedCategories.includes('Audio')));
test('Empty input → no signals', () => assert(!Object.values(detectIntent('').signals).some((s) => s > 0)));

// ── RECOMMENDATION ENGINE ────────────────────────────────────
console.log('\n[RECOMMENDATION ENGINE]');
test('Returns array for valid input', () => { const r = getRecommendations('write python code', MODELS); assert(Array.isArray(r) && r.length > 0); });
test('Returns 3 by default', () => assertEqual(getRecommendations('complex reasoning task', MODELS).length, 3));
test('Returns N when topN specified', () => assertEqual(getRecommendations('coding', MODELS, 2).length, 2));
test('Each result has required fields', () => {
  for (const r of getRecommendations('code review', MODELS))
    for (const f of ['rank','model','matchPercentage','reasoning','dominantCapabilities'])
      assert(r[f] !== undefined, `Missing '${f}'`);
});
test('matchPercentage in [40,99]', () => { for (const r of getRecommendations('code review', MODELS)) assertInRange(r.matchPercentage, 40, 99); });
test('Ranks ordered 1,2,3', () => { getRecommendations('research', MODELS).forEach((r, i) => assertEqual(r.rank, i + 1)); });
test('Coding query → coding-capable model in #1', () => {
  const top = getRecommendations('write and debug python functions', MODELS)[0].model;
  assert(top.categories.includes('Code') || top.scores.coding >= 80, `Got ${top.name}`);
});
test('Image query → Image Generation model in top 3', () => {
  assert(getRecommendations('generate beautiful images and art illustrations', MODELS).some((r) => r.model.categories.includes('Image Generation')));
});
test('Audio query → Audio model in top 3', () => {
  assert(getRecommendations('transcribe podcast audio speech to text', MODELS).some((r) => r.model.categories.includes('Audio')));
});
test('Cost query → budget/free model in top 3', () => {
  assert(getRecommendations('cheap affordable open source local deployment', MODELS).some((r) => ['free','budget'].includes(r.model.pricing.tier)));
});
test('Input < 4 chars → empty array', () => assertEqual(getRecommendations('hi', MODELS).length, 0));
test('null input → empty array', () => assertEqual(getRecommendations(null, MODELS).length, 0));
test('First result has highest match%', () => {
  const r = getRecommendations('build a fast chatbot', MODELS);
  for (let i = 0; i < r.length - 1; i++) assert(r[i].matchPercentage >= r[i+1].matchPercentage);
});

// ── CATEGORY COVERAGE ────────────────────────────────────────
console.log('\n[CATEGORY COVERAGE]');
test('Key categories have models', () => {
  for (const cat of ['Text Generation','Code','Image Generation','Audio','Reasoning'])
    assert(MODELS.some((m) => m.categories.includes(cat)), `No models for '${cat}'`);
});
test('At least 3 open-source models', () => assert(MODELS.filter((m) => m.openSource).length >= 3));
test('All 4 pricing tiers present', () => {
  const tiers = new Set(MODELS.map((m) => m.pricing.tier));
  for (const t of ['free','budget','mid','premium']) assert(tiers.has(t), `Missing tier '${t}'`);
});

// ── RESULTS ──────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length) { failures.forEach((f) => console.log(`  ✗ ${f.name}: ${f.error}`)); process.exit(1); }
else { console.log('\n✓ All tests passed!\n'); process.exit(0); }
