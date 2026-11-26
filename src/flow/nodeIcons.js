// A small icon per node, picked from what the node does. Order matters: the
// first rule that matches wins, so specific roles sit above generic "AI".
const RULES = [
  [/webhook/i, 'bolt'],
  [/router/i, 'split'],
  [/validator|guard/i, 'shield'],
  [/scor/i, 'gauge'],
  [/cron|follow-up|schedule/i, 'clock'],
  [/history/i, 'history'],
  [/notify|reply|message/i, 'chat'],
  [/dashboard/i, 'chart'],
  [/supabase|sheet|config|database|\bdb\b/i, 'db'],
  [/retriev|search|google/i, 'search'],
  [/chunk/i, 'layers'],
  [/json|parse|extract|filter|clean/i, 'braces'],
  [/answer|sources/i, 'check'],
  [/claude|haiku|sonnet|gpt|llm|generate|analy|\bai\b/i, 'spark'],
  [/pdf|cv|resume|description|document/i, 'doc'],
];

export const ICON_PATHS = {
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  split: 'M6 3v6a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v4M6 21v-8M3 18l3 3 3-3M15 6l3-3 3 3M18 3v4',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6zM9 12l2 2 4-4',
  gauge: 'M4 18a8 8 0 1 1 16 0M12 18l4-6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  chat: 'M4 5h16v11H9l-5 4zM8 10h8M8 13h5',
  chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
  db: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
  layers: 'm12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  braces: 'M8 3H7a2 2 0 0 0-2 2v4l-2 3 2 3v4a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v4l2 3-2 3v4a2 2 0 0 1-2 2h-1',
  check: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 15l2 2 4-4',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z',
  doc: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5',
  dot: 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
};

export function iconFor(label) {
  const hit = RULES.find(([re]) => re.test(label));
  return hit ? hit[1] : 'dot';
}

// Colour family per icon — the canvas tints each node's icon by what it is.
const KINDS = {
  bolt: 'trigger', clock: 'trigger', doc: 'trigger',
  spark: 'ai', split: 'ai',
  db: 'data', history: 'data', search: 'data', layers: 'data',
  braces: 'logic', gauge: 'logic',
  shield: 'guard',
  chat: 'output', chart: 'output', check: 'output',
  dot: 'logic',
};

export function kindFor(icon) {
  return KINDS[icon] ?? 'logic';
}

// The small grey line under a node name, like n8n's operation subtitle.
export const SUBTITLES = {
  bolt: 'Trigger',
  clock: 'Schedule trigger',
  doc: 'Input',
  spark: 'AI model',
  split: 'AI router',
  db: 'Storage',
  history: 'Memory',
  search: 'Retrieval',
  layers: 'Chunking',
  braces: 'Transform',
  gauge: 'Scoring',
  shield: 'Guardrail',
  chat: 'Send message',
  chart: 'Output',
  check: 'Output',
  dot: 'Step',
};
