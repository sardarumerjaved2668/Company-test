// NexusAI-DB — Recommendation Engine
// Strategy: Keyword Detection + Adaptive Weighted Capability Scoring

const KEYWORD_MAPS = {
  reasoning:      ['reason','reasoning','logic','analyze','analysis','problem','solve','math','complex','graduate','research','scientific','academic','advanced','deep'],
  coding:         ['code','coding','program','programming','developer','debug','debugging','software','engineer','api','python','javascript','typescript','sql','refactor'],
  creativity:     ['creative','creativity','write','writing','story','content','blog','article','essay','poem','marketing','copy','art','design','illustration','visual','brand'],
  speed:          ['fast','speed','quick','realtime','real-time','instant','low latency','responsive','rapid','efficient','high volume','batch','scale'],
  multimodal:     ['image','vision','visual','picture','photo','video','audio','speech','voice','multimodal','ocr','scan','screenshot','transcribe','transcription','listen'],
  contextHandling:['long','context','document','pdf','book','lengthy','extended','entire','complete text','long context','memory'],
  costEfficiency: ['cheap','affordable','budget','cost','free','low cost','inexpensive','economical','open source','self-host','local','offline'],
};

const CATEGORY_HINTS = {
  'Image Generation':['image','picture','photo','illustration','art','generate image','visual content'],
  'Audio':           ['audio','speech','voice','transcribe','transcription','podcast','whisper','sound','listen','stt'],
  'Code':            ['code','coding','program','developer','software','debug'],
  'Reasoning':       ['reason','logic','analyze','problem','math','research'],
  'Open Source':     ['open source','self-host','local','offline','llama','gemma'],
  'Enterprise':      ['enterprise','business','compliance','security','rag','retrieval'],
  'Multimodal':      ['multimodal','vision','video','image understanding'],
  'Chat':            ['chat','conversation','assistant','talk','dialogue'],
};

const BASE_WEIGHTS = { reasoning:0.22, coding:0.20, creativity:0.15, speed:0.12, multimodal:0.13, contextHandling:0.10, costEfficiency:0.08 };
const SPECIALIZED = new Set(['Image Generation', 'Audio']);

function detectIntent(input) {
  const text = (input || '').toLowerCase();
  const signals = {};
  for (const [cap, kws] of Object.entries(KEYWORD_MAPS)) {
    signals[cap] = Math.min(kws.filter((k) => text.includes(k)).length / 3, 1.0);
  }
  const detectedCategories = Object.entries(CATEGORY_HINTS)
    .filter(([, kws]) => kws.some((k) => text.includes(k)))
    .map(([cat]) => cat);
  return { signals, detectedCategories };
}

function computeWeights(signals) {
  const w = { ...BASE_WEIGHTS };
  for (const [cap, sig] of Object.entries(signals)) {
    if (sig > 0.1) w[cap] = (w[cap] || 0) + sig * 0.5;
  }
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(w)) w[k] /= total;
  return w;
}

function scoreModel(model, weights, detectedCategories) {
  const specialized = detectedCategories.some((c) => SPECIALIZED.has(c));
  let score = Object.entries(weights).reduce((s, [cap, w]) => s + ((model.scores?.[cap] ?? 0) / 100) * w, 0);
  const bonus = specialized ? 0.50 : 0.08;
  const cap = specialized ? 0.70 : 0.20;
  const categoryBonus = detectedCategories.reduce((b, c) => (model.categories || []).includes(c) ? b + bonus : b, 0);
  return Math.min(score + Math.min(categoryBonus, cap), 1.0);
}

function getRecommendations(userInput, models, topN = 3) {
  if (!userInput || userInput.trim().length < 3) return [];
  const { signals, detectedCategories } = detectIntent(userInput);
  const weights = computeWeights(signals);
  const scored = models.map((m) => ({ model: m, raw: scoreModel(m, weights, detectedCategories) }));
  scored.sort((a, b) => b.raw - a.raw);
  const top = scored.slice(0, topN);
  const maxRaw = top[0]?.raw || 1;
  const topCaps = Object.entries(weights).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
  const CAP_LABELS = { reasoning:'reasoning', coding:'code generation', creativity:'creative output', speed:'fast responses', multimodal:'multimodal understanding', contextHandling:'long-context processing', costEfficiency:'cost efficiency' };

  return top.map(({ model, raw }, i) => {
    const pct = Math.min(Math.max(Math.round((raw / maxRaw) * 30 + raw * 70), 40), 99);
    const matchingCats = detectedCategories.filter((c) => (model.categories || []).includes(c));
    const capStr = topCaps.slice(0, 2).map((c) => CAP_LABELS[c]).join(' and ');
    let reasoning = `Strong match for ${capStr}`;
    if (matchingCats.length) reasoning += `. Covers ${matchingCats.slice(0, 2).join(', ')} use cases`;
    if (model.strengths?.[0]) reasoning += `. ${model.strengths[0]}.`;
    return { rank: i + 1, model, matchPercentage: pct, reasoning, dominantCapabilities: topCaps };
  });
}

module.exports = { getRecommendations, detectIntent };
