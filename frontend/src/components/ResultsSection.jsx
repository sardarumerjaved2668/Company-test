const ICONS = { OpenAI:'🤖', Anthropic:'🧿', Google:'♊', Meta:'🦙', 'Mistral AI':'🌪', 'Stability AI':'🎨', Midjourney:'🖼', Cohere:'🔗', Microsoft:'⊞' };
const BG    = { OpenAI:'#0d3326', Anthropic:'#3d1c0e', Google:'#0d1f3d', Meta:'#0a1e38', 'Mistral AI':'#2a1500', 'Stability AI':'#1a0a2e', Midjourney:'#2a0a0f', Cohere:'#0a2a10', Microsoft:'#001830' };

export default function ResultsSection({ results, onModelClick }) {
  if (!results || results.length === 0) return null;

  return (
    <section className="results-section visible">
      <div className="results-header">
        <h3>Top Recommendations</h3>
        <span className="results-tag">✦ Algorithm Match</span>
      </div>
      <div className="results-grid">
        {results.map(({ rank, model, matchPercentage, reasoning, dominantCapabilities }) => {
          const matchClass = matchPercentage >= 85 ? 'match-high' : matchPercentage >= 70 ? 'match-mid' : 'match-ok';
          return (
            <div
              key={model._id || model.slug}
              className="result-card"
              style={{ animationDelay: `${(rank-1)*80}ms` }}
              onClick={() => onModelClick(model)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onModelClick(model)}
            >
              <div className={`result-rank rank-${rank}`}>#{rank}</div>
              <div className={`result-match ${matchClass}`}><span>▲</span> {matchPercentage}% match</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div className="card-icon" style={{ background:BG[model.provider]||'#1a2233', width:36, height:36, fontSize:16, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {ICONS[model.provider]||'🧠'}
                </div>
                <div>
                  <div className="result-model-name">{model.name}</div>
                  <div className="result-provider">{model.provider}</div>
                </div>
              </div>
              <p className="result-reasoning">{reasoning}</p>
              <div className="result-caps">
                {(dominantCapabilities||[]).slice(0,3).map((c)=><span key={c} className="cap-tag">{c}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
