import { icons } from './icons/ToolIcons';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Stack.css';

const GROUPS = [
  {
    label: 'AI / LLM',
    items: ['Claude API', 'Cekat AI', 'n8n', 'TensorFlow', 'Hugging Face'],
  },
  {
    label: 'Languages & Data',
    items: ['Python', 'SQL', 'Pandas', 'Streamlit'],
  },
  {
    label: 'Web & Infra',
    items: ['React', 'Supabase', 'Vercel'],
  },
];

export default function Stack() {
  const revealRef = useScrollReveal();
  return (
    <section id="stack" className="section stack-section">
      <div className="section-head">
        <p className="section-eyebrow">Toolbox</p>
        <h2 className="section-title">The stack I run daily.</h2>
      </div>

      <div className="stack-groups" ref={revealRef}>
        {GROUPS.map((g) => (
          <div key={g.label} className="stack-group">
            <p className="stack-group-label mono">{g.label}</p>
            <div className="stack-group-items">
              {g.items.map((item) => (
                <span key={item} className="stack-item">
                  <span className="stack-item-icon" aria-hidden="true">{icons[item]}</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
