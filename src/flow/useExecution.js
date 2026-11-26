import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSchedule } from './graph.js';

const RUN_MS = 700;
const WIRE_MS = 450;
const RETRY_MS = 650;

const fresh = (graph) => ({
  status: 'idle',
  nodes: graph.nodes.map(() => ({ status: 'idle', runs: 0 })),
  edges: graph.edges.map(() => 'idle'),
  current: -1,
  log: [],
});

// Runs the canvas only when asked. Each node runs, then hands its data down
// every outgoing wire, in the order buildSchedule lays out. Reduced motion
// skips the wait and lands on the finished state in one step.
export default function useExecution(graph, { reduced = false } = {}) {
  const schedule = useMemo(() => buildSchedule(graph), [graph]);
  const [state, setState] = useState(() => fresh(graph));
  const timers = useRef([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const execute = useCallback(() => {
    clear();
    let s = { ...fresh(graph), status: 'running' };
    setState(s);

    const later = (ms, fn) => new Promise((res) => {
      if (reduced) { fn(); res(); return; }
      timers.current.push(setTimeout(() => { fn(); res(); }, ms));
    });
    const commit = (patch) => { s = { ...s, ...patch(s) }; setState(s); };
    const label = (i) => graph.nodes[i].label;

    (async () => {
      for (const ev of schedule) {
        if (ev.type === 'run') {
          await later(60, () => commit((p) => ({
            current: ev.node,
            nodes: p.nodes.map((n, i) => (i === ev.node ? { status: 'running', runs: n.runs + 1 } : n)),
            log: [...p.log, { id: p.log.length, node: ev.node, label: label(ev.node), kind: 'run' }],
          })));
          await later(RUN_MS, () => {});
        } else if (ev.type === 'retry') {
          await later(0, () => commit((p) => ({
            nodes: p.nodes.map((n, i) => (i === ev.node ? { ...n, status: 'retry' } : n)),
            edges: p.edges.map((e, k) => (k === ev.edge ? 'active' : e)),
            log: settle(p.log, ev.node, 'retry', `back to ${label(ev.target)}`),
          })));
          await later(RETRY_MS, () => commit((p) => ({
            edges: p.edges.map((e, k) => (k === ev.edge ? 'retried' : e)),
          })));
        } else if (ev.type === 'done') {
          await later(0, () => commit((p) => ({
            nodes: p.nodes.map((n, i) => (i === ev.node ? { ...n, status: 'success' } : n)),
            edges: p.edges.map((e, k) => (ev.edges.includes(k) ? 'active' : e)),
            log: settle(p.log, ev.node, 'ok'),
          })));
          if (ev.edges.length) {
            await later(WIRE_MS, () => commit((p) => ({
              edges: p.edges.map((e, k) => (ev.edges.includes(k) ? 'done' : e)),
            })));
          }
        }
      }
      commit((p) => ({ status: 'done', log: [...p.log, { id: p.log.length, kind: 'complete' }] }));
    })();
  }, [graph, schedule, reduced]);

  const reset = useCallback(() => { clear(); setState(fresh(graph)); }, [graph]);

  return { ...state, execute, reset };
}

// Turns the newest "run" line for a node into its outcome.
function settle(log, node, kind, note) {
  const idx = log.findLastIndex((l) => l.node === node && l.kind === 'run');
  if (idx < 0) return log;
  return log.map((l, i) => (i === idx ? { ...l, kind, note } : l));
}
