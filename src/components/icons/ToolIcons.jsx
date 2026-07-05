// Minimal monoline icons, drawn to match the workbench aesthetic —
// deliberately not colorful brand logos, so the toolbox row stays calm.

const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const icons = {
  'Claude API': (
    <svg {...common}><path d="M12 3l2.4 6.2 6.6.3-5.2 4.1 1.9 6.4-5.7-3.8-5.7 3.8 1.9-6.4-5.2-4.1 6.6-.3z" /></svg>
  ),
  'Cekat AI': (
    <svg {...common}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="11" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="11" r="1.2" fill="currentColor" stroke="none" /><path d="M8.5 15c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5" /></svg>
  ),
  n8n: (
    <svg {...common}><circle cx="6" cy="7" r="2.4" /><circle cx="18" cy="7" r="2.4" /><circle cx="12" cy="17" r="2.4" /><path d="M8.2 8.2L11 15M15.8 8.2L13 15" /></svg>
  ),
  TensorFlow: (
    <svg {...common}><path d="M12 2v20M4 6l8-4 8 4M4 6v12l8 4M20 6v12l-8 4M4 6l8 4M20 6l-8 4" /></svg>
  ),
  'Hugging Face': (
    <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" /><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" /><path d="M6 8.5C5 7.5 5 6 6 5M18 8.5c1-1 1-2.5 0-3.5" /></svg>
  ),
  Python: (
    <svg {...common}><path d="M12 3c-3 0-5 1-5 3v3h5v1H5c-2 0-3 1.5-3 4s1 4 3 4h2v-3c0-2 1.5-3.5 3.5-3.5h4c1.5 0 3-1.5 3-3.5V6c0-2-2-3-6-3z" /><path d="M12 21c3 0 5-1 5-3v-3h-5v-1h7c2 0 3-1.5 3-4s-1-4-3-4h-2v3c0 2-1.5 3.5-3.5 3.5h-4c-1.5 0-3 1.5-3 3.5v2c0 2 2 3 6 3z" /><circle cx="9" cy="5.5" r=".6" fill="currentColor" stroke="none" /><circle cx="15" cy="18.5" r=".6" fill="currentColor" stroke="none" /></svg>
  ),
  SQL: (
    <svg {...common}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></svg>
  ),
  Pandas: (
    <svg {...common}><rect x="3.5" y="4" width="4" height="16" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><rect x="16.5" y="4" width="4" height="10" rx="1" /></svg>
  ),
  Streamlit: (
    <svg {...common}><path d="M4 12L12 4l3 3-5 5 5 5-3 3z" /><path d="M13 13l3-3 4 4-3 3z" /></svg>
  ),
  React: (
    <svg {...common}><ellipse cx="12" cy="12" rx="10" ry="4.2" /><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>
  ),
  Supabase: (
    <svg {...common}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
  ),
  Vercel: (
    <svg {...common}><path d="M12 3l9 16H3z" /></svg>
  ),
};
