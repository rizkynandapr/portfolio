import { useEffect, useId, useRef, useState } from 'react';
import { ICON_PATHS } from './nodeIcons.js';
import './FlowCanvas.css';

const pad = (n) => String(n).padStart(2, '0');

// Scales the fixed-size canvas down to its container, never below a floor —
// past that the canvas pans sideways, the way an n8n canvas would.
function useFit(ref, width, min = 0.62) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (w > 0) setScale(Math.max(min, Math.min(1, w / width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, width, min]);
  return scale;
}

function Icon({ name, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON_PATHS[name] ?? ICON_PATHS.dot} />
    </svg>
  );
}

// An n8n-style canvas: node tiles with input and output ports, bezier wires
// with arrowheads, and nothing moving until "Execute workflow" is pressed.
export default function FlowCanvas({ graph, exec, selected, onSelect, onExecute, name }) {
  const wrapRef = useRef(null);
  const scale = useFit(wrapRef, graph.width);
  const uid = useId().replace(/:/g, '');
  const running = exec.status === 'running';
  const done = exec.status === 'done';
  const current = exec.current;

  // On a narrow screen the canvas pans; keep the running node in view.
  useEffect(() => {
    const el = wrapRef.current;
    const node = graph.nodes[current];
    if (!el || !node || el.scrollWidth <= el.clientWidth + 1 || !el.scrollTo) return;
    el.scrollTo({ left: node.x * scale - el.clientWidth / 2, behavior: 'smooth' });
  }, [current, graph, scale]);

  return (
    <div className="n8n" data-status={exec.status}>
      <div className="n8n-viewport" ref={wrapRef}>
        <div
          className="n8n-stage"
          style={{ width: graph.width * scale, height: graph.height * scale }}
        >
          <div
            className="n8n-canvas"
            style={{ width: graph.width, height: graph.height, transform: scale < 1 ? `scale(${scale})` : undefined }}
          >
            <svg className="n8n-wires" width={graph.width} height={graph.height} aria-hidden="true">
              <defs>
                {['idle', 'done', 'active', 'retry'].map((t) => (
                  <marker key={t} id={`arrow-${t}-${uid}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 1 L 8 5 L 0 9 z" className={`n8n-arrow n8n-arrow-${t}`} />
                  </marker>
                ))}
              </defs>

              {graph.edges.map((e) => {
                const st = exec.edges[e.k];
                const tone = e.kind === 'retry'
                  ? (st === 'idle' ? 'idle' : 'retry')
                  : st === 'done' ? 'done' : st === 'active' ? 'active' : 'idle';
                return (
                  <g key={e.key} className="n8n-wire" data-kind={e.kind} data-state={st} data-wire={e.key}>
                    <path className="n8n-wire-hit" d={e.d} />
                    <path className="n8n-wire-line" d={e.d} markerEnd={`url(#arrow-${tone}-${uid})`} />
                    {st === 'active' && (
                      <>
                        <path className="n8n-wire-flow" d={e.d} pathLength="1" />
                        <circle r="4.5" className="n8n-packet">
                          <animateMotion dur={e.kind === 'retry' ? '0.65s' : '0.45s'} fill="freeze" path={e.d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".4 0 .2 1" />
                        </circle>
                      </>
                    )}
                    {e.kind === 'retry' && (
                      <g className="n8n-wire-tag" transform={`translate(${e.mid.x} ${e.mid.y})`}>
                        <rect x="-44" y="-11" width="88" height="22" rx="11" />
                        <text textAnchor="middle" dy="4">↻ regenerate</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {graph.nodes.map((n) => {
              const st = exec.nodes[n.i];
              return (
                <button
                  key={n.label}
                  type="button"
                  className="n8n-node"
                  data-node={n.i}
                  data-kind={n.kind}
                  data-status={st.status}
                  data-trigger={n.trigger ? 'true' : undefined}
                  data-selected={selected === n.i ? 'true' : undefined}
                  aria-pressed={selected === n.i}
                  aria-label={`${pad(n.i + 1)} ${n.label}, ${st.status === 'idle' ? 'not run' : st.status}`}
                  style={{ left: n.x, top: n.y, '--k': n.i }}
                  onClick={() => onSelect(n.i)}
                >
                  <span className="n8n-tile">
                    {n.trigger && <span className="n8n-bolt" aria-hidden="true"><Icon name="bolt" size={11} /></span>}
                    <span className="n8n-icon"><Icon name={n.icon} /></span>
                    {!n.trigger && <span className="n8n-port n8n-port-in" />}
                    <span className="n8n-port n8n-port-out" />
                    {st.status === 'success' && (
                      <span className="n8n-badge n8n-badge-ok" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="m5 12 5 5 9-10" /></svg>
                        {st.runs > 1 && <span className="n8n-runs">{st.runs}</span>}
                      </span>
                    )}
                    {st.status === 'retry' && <span className="n8n-badge n8n-badge-retry" aria-hidden="true">!</span>}
                  </span>
                  <span className="n8n-label">{n.label}</span>
                  <span className="n8n-sub mono">{n.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="n8n-dock">
        <button
          type="button"
          className="n8n-exec"
          onClick={onExecute}
          disabled={running}
          aria-label={`${done ? 'Run again' : 'Execute workflow'}: ${name}`}
        >
          {running ? (
            <span className="n8n-spin" aria-hidden="true" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9" />
            </svg>
          )}
          {running ? 'Executing…' : done ? 'Run again' : 'Execute workflow'}
        </button>
      </div>
    </div>
  );
}
