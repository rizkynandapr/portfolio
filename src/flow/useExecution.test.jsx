import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useExecution from './useExecution.js';
import { buildGraph } from './graph.js';

const node = (label) => ({ label, detail: 'd' });
const GRAPH = buildGraph({
  flow: ['Generate (Sonnet)', 'Citation Validator', 'Answer + Sources'].map(node),
  canvas: { at: [[0, 0], [1, 0], [2, 0]], edges: [[0, 1], [1, 2], [1, 0, 'retry']] },
});

afterEach(() => vi.useRealTimers());

const drain = async () => {
  for (let t = 0; t < 60; t++) {
    await act(async () => { vi.advanceTimersByTime(200); });
  }
};

describe('useExecution', () => {
  it('starts idle and stays idle without a trigger', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useExecution(GRAPH));
    await drain();
    expect(result.current.status).toBe('idle');
    expect(result.current.nodes.every((n) => n.status === 'idle')).toBe(true);
  });

  it('runs to success, re-running the retry target', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useExecution(GRAPH));
    act(() => result.current.execute());
    expect(result.current.status).toBe('running');
    await drain();
    expect(result.current.status).toBe('done');
    expect(result.current.nodes.map((n) => n.status)).toEqual(['success', 'success', 'success']);
    expect(result.current.nodes[0].runs).toBe(2);
    expect(result.current.edges).toEqual(['done', 'done', 'retried']);
    expect(result.current.log.some((l) => l.kind === 'retry')).toBe(true);
    expect(result.current.log.at(-1).kind).toBe('complete');
  });

  it('lands on the finished state without waiting under reduced motion', async () => {
    const { result } = renderHook(() => useExecution(GRAPH, { reduced: true }));
    await act(async () => { result.current.execute(); });
    expect(result.current.status).toBe('done');
  });
});
