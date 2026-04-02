import { useCallback } from 'react';

const KEYWORD_MAP = {
  image:    { capabilities: ['image-generation', 'art', 'design', 'creative', 'text-to-image', 'photorealistic'], scoreKeys: ['creativity', 'multimodal'], weight: 1.5 },
  picture:  { capabilities: ['image-generation', 'art', 'design', 'creative'], scoreKeys: ['creativity', 'multimodal'], weight: 1.4 },
  art:      { capabilities: ['image-generation', 'art', 'creative', 'design'], scoreKeys: ['creativity'], weight: 1.4 },
  draw:     { capabilities: ['image-generation', 'art', 'creative'], scoreKeys: ['creativity'], weight: 1.3 },
  design:   { capabilities: ['image-generation', 'design', 'creative', 'art'], scoreKeys: ['creativity'], weight: 1.3 },
  voice:    { capabilities: ['voice', 'audio', 'text-to-speech', 'voice-cloning', 'speech-recognition'], scoreKeys: ['multimodal', 'speed'], weight: 1.5 },
  audio:    { capabilities: ['audio', 'voice', 'text-to-speech', 'music', 'speech-recognition'], scoreKeys: ['multimodal'], weight: 1.5 },
  music:    { capabilities: ['music', 'audio', 'text-to-music', 'creative'], scoreKeys: ['creativity'], weight: 1.6 },
  speech:   { capabilities: ['voice', 'audio', 'text-to-speech', 'speech-recognition'], scoreKeys: ['multimodal', 'speed'], weight: 1.5 },
  transcri: { capabilities: ['transcription', 'speech-recognition', 'audio'], scoreKeys: ['speed', 'multimodal'], weight: 1.6 },
  code:     { capabilities: ['code', 'code-completion', 'refactoring', 'testing'], scoreKeys: ['coding', 'reasoning'], weight: 1.4 },
  program:  { capabilities: ['code', 'code-completion'], scoreKeys: ['coding', 'reasoning'], weight: 1.3 },
  develop:  { capabilities: ['code', 'code-completion', 'refactoring'], scoreKeys: ['coding'], weight: 1.3 },
  debug:    { capabilities: ['code', 'refactoring', 'testing'], scoreKeys: ['coding', 'reasoning'], weight: 1.4 },
  write:    { capabilities: ['text', 'creative', 'analysis'], scoreKeys: ['creativity', 'reasoning'], weight: 1.2 },
  content:  { capabilities: ['text', 'creative', 'multilingual'], scoreKeys: ['creativity'], weight: 1.2 },
  blog:     { capabilities: ['text', 'creative'], scoreKeys: ['creativity', 'reasoning'], weight: 1.2 },
  translate:{ capabilities: ['multilingual', 'translation'], scoreKeys: ['reasoning', 'speed'], weight: 1.4 },
  language: { capabilities: ['multilingual', 'translation', 'text'], scoreKeys: ['reasoning'], weight: 1.2 },
  search:   { capabilities: ['search', 'rag', 'citation', 'real-time', 'research'], scoreKeys: ['reasoning', 'contextHandling'], weight: 1.4 },
  research: { capabilities: ['search', 'research', 'citation', 'analysis', 'reasoning'], scoreKeys: ['reasoning', 'contextHandling'], weight: 1.4 },
  analyse:  { capabilities: ['analysis', 'reasoning', 'rag'], scoreKeys: ['reasoning', 'contextHandling'], weight: 1.3 },
  analyze:  { capabilities: ['analysis', 'reasoning', 'rag'], scoreKeys: ['reasoning', 'contextHandling'], weight: 1.3 },
  data:     { capabilities: ['analysis', 'reasoning', 'code'], scoreKeys: ['reasoning', 'coding'], weight: 1.2 },
  video:    { capabilities: ['video', 'image-understanding', 'multimodal'], scoreKeys: ['multimodal', 'creativity'], weight: 1.4 },
  chat:     { capabilities: ['text', 'reasoning', 'multilingual'], scoreKeys: ['speed', 'reasoning'], weight: 1.1 },
  fast:     { capabilities: ['speed'], scoreKeys: ['speed', 'costEfficiency'], weight: 1.5 },
  cheap:    { capabilities: ['self-hosting', 'fine-tuning'], scoreKeys: ['costEfficiency'], weight: 1.6 },
  budget:   { capabilities: ['self-hosting'], scoreKeys: ['costEfficiency'], weight: 1.5 },
  free:     { capabilities: ['self-hosting', 'fine-tuning'], scoreKeys: ['costEfficiency'], weight: 1.7 },
  open:     { capabilities: ['self-hosting', 'fine-tuning'], scoreKeys: ['costEfficiency'], weight: 1.4 },
  enterprise: { capabilities: ['enterprise', 'rag', 'citation', 'safety'], scoreKeys: ['reasoning', 'contextHandling'], weight: 1.3 },
  safe:     { capabilities: ['safety'], scoreKeys: ['reasoning'], weight: 1.2 },
  long:     { capabilities: ['long-context'], scoreKeys: ['contextHandling'], weight: 1.4 },
  document: { capabilities: ['long-context', 'analysis', 'text'], scoreKeys: ['contextHandling', 'reasoning'], weight: 1.3 },
  summarize:{ capabilities: ['text', 'analysis', 'long-context'], scoreKeys: ['reasoning', 'contextHandling'], weight: 1.3 },
  summary:  { capabilities: ['text', 'analysis', 'long-context'], scoreKeys: ['reasoning', 'contextHandling'], weight: 1.3 },
};

function scoreModel(model, queryTokens) {
  let capHits = 0;
  let capTotal = 0;
  let scoreSum = 0;
  let scoreWeightSum = 0;

  const modelCaps = new Set((model.capabilities || []).map((c) => c.toLowerCase()));
  const modelCats = new Set((model.categories || []).map((c) => c.toLowerCase()));

  const matchedCaps = [];

  for (const token of queryTokens) {
    const mapping = Object.entries(KEYWORD_MAP).find(([key]) => token.startsWith(key));
    if (!mapping) continue;

    const [, { capabilities, scoreKeys, weight }] = mapping;
    capTotal += capabilities.length;

    for (const cap of capabilities) {
      if (modelCaps.has(cap)) {
        capHits += weight;
        matchedCaps.push(cap);
      }
    }

    for (const sk of scoreKeys) {
      const val = model.scores?.[sk] ?? 0;
      if (val > 0) {
        scoreSum += val * weight;
        scoreWeightSum += 100 * weight;
      }
    }
  }

  // Category bonus
  for (const token of queryTokens) {
    for (const cat of modelCats) {
      if (cat.includes(token)) {
        capHits += 0.5;
        capTotal += 1;
      }
    }
  }

  if (capTotal === 0) {
    // No keywords matched — score based on overall model quality
    const avgScore = Object.values(model.scores || {}).reduce((a, b) => a + b, 0) /
      Math.max(Object.values(model.scores || {}).length, 1);
    return { matchPercentage: Math.round(Math.min(avgScore * 0.6, 55)), dominantCapabilities: model.categories?.slice(0, 3) || [] };
  }

  const capRatio = capHits / Math.max(capTotal, 1);
  const scoreRatio = scoreWeightSum > 0 ? scoreSum / scoreWeightSum : 0;

  let rawPct = (capRatio * 60 + scoreRatio * 40);
  rawPct = Math.max(40, Math.min(99, Math.round(rawPct)));

  const uniqueCaps = [...new Set(matchedCaps)].slice(0, 4);
  const dominantCapabilities = uniqueCaps.length > 0 ? uniqueCaps : model.categories?.slice(0, 3) || [];

  return { matchPercentage: rawPct, dominantCapabilities };
}

function generateReasoning(model, queryTokens, matchPercentage) {
  const strengths = (model.strengths || []).slice(0, 2);
  const capStr = (model.categories || []).slice(0, 3).join(', ');
  if (matchPercentage >= 85) {
    return `${model.name} is an excellent fit for this use case. ${strengths[0] || ''} It specializes in ${capStr}.`;
  }
  if (matchPercentage >= 70) {
    return `${model.name} is a strong candidate. ${strengths[0] || ''} Key strengths include ${capStr}.`;
  }
  return `${model.name} offers relevant capabilities in ${capStr}. ${strengths[1] || strengths[0] || ''}`;
}

export function useRecommendation() {
  const recommend = useCallback((query, models) => {
    if (!query || query.trim().length < 4 || !models?.length) return [];

    const queryTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length >= 3);

    if (queryTokens.length === 0) return [];

    const scored = models.map((model) => {
      const { matchPercentage, dominantCapabilities } = scoreModel(model, queryTokens);
      const reasoning = generateReasoning(model, queryTokens, matchPercentage);
      return { model, matchPercentage, dominantCapabilities, reasoning };
    });

    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return scored.slice(0, 3).map((item, i) => ({
      rank: i + 1,
      ...item,
    }));
  }, []);

  return { recommend };
}
