'use client';

const FEED_ITEMS = [
  {
    id: 1,
    month: 'MAR',
    day: '26',
    lab: 'Google DeepMind',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    summary:
      'Scores 82.3% on AIME 2025 math competition, outperforming all prior models on reasoning‑intensive tasks.',
  },
  {
    id: 2,
    month: 'MAR',
    day: '22',
    lab: 'MIT CSAIL',
    title: 'Scaling laws for multimodal models: new empirical findings',
    summary:
      'Research reveals unexpected scaling dynamics when combining vision and language — efficiency gains plateau earlier than expected.',
  },
  {
    id: 3,
    month: 'MAR',
    day: '18',
    lab: 'Anthropic',
    title: 'Constitutional AI v2: improved alignment through iterative refinement',
    summary:
      'New methodology achieves 40% reduction in harmful outputs while preserving capability on standard benchmarks.',
  },
  {
    id: 4,
    month: 'MAR',
    day: '15',
    lab: 'Nexus AI',
    title: 'Llama 4 Scout & Maverick: natively multimodal from the ground up',
    summary:
      '17B MoE architecture trained on 40 trillion tokens with native understanding across text, images, and audio.',
  },
  {
    id: 5,
    month: 'MAR',
    day: '10',
    lab: 'Stanford NLP',
    title: 'Long‑context recall: how models handle 1M+ token windows',
    summary:
      'Comprehensive evaluation shows sharp recall degradation beyond 200K tokens for most frontier models.',
  },
  {
    id: 6,
    month: 'FEB',
    day: '5',
    lab: 'DeepSeek‑R1',
    title: 'DeepSeek‑R1 open weights: reproducing frontier reasoning at minimal cost',
    summary:
      'Full weight release enables fine‑tuning for domain‑specific reasoning at a fraction of frontier model prices.',
  },
];

export default function DiscoverNewPage() {
  return (
    <main>
      <div className="app-wrapper mk-app-full">
        <header className="dn-header">
          <h1 className="dn-title">AI Research Feed</h1>
        </header>

        <section className="dn-feed">
          {FEED_ITEMS.map((item) => (
            <article key={item.id} className="dn-card">
              <div className="dn-card-date">
                <span className="dn-card-month">{item.month}</span>
                <span className="dn-card-day">{item.day}</span>
              </div>
              <div className="dn-card-main">
                <div className="dn-card-lab">{item.lab}</div>
                <h2 className="dn-card-title">{item.title}</h2>
                <p className="dn-card-summary">{item.summary}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

