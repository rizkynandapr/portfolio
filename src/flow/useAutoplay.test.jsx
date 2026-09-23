import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import useAutoplay from './useAutoplay.js';

let ioCallback;
beforeEach(() => {
  vi.useFakeTimers();
  globalThis.IntersectionObserver = class {
    constructor(cb) { ioCallback = cb; }
    observe() {}
    disconnect() {}
  };
});
afterEach(() => { vi.useRealTimers(); delete globalThis.IntersectionObserver; });

function Harness({ steps, enabled, onState }) {
  const ref = useRef(null);
  const state = useAutoplay({ ref, steps, enabled, interval: 1000, resumeAfter: 5000 });
  onState(state);
  return <div ref={ref} />;
}

describe('useAutoplay', () => {
  it('does not advance until the trace is visible', () => {
    let s;
    render(<Harness steps={4} enabled onState={(x) => { s = x; }} />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(s.active).toBe(0);

    act(() => { ioCallback([{ isIntersecting: true }]); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(s.active).toBe(2);
  });

  it('wraps around after the last node', () => {
    let s;
    render(<Harness steps={3} enabled onState={(x) => { s = x; }} />);
    act(() => { ioCallback([{ isIntersecting: true }]); });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(s.active).toBe(0);
  });

  it('pauses on select and resumes later', () => {
    let s;
    render(<Harness steps={5} enabled onState={(x) => { s = x; }} />);
    act(() => { ioCallback([{ isIntersecting: true }]); });
    act(() => { s.select(3); });
    expect(s.active).toBe(3);
    expect(s.paused).toBe(true);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(s.active).toBe(3);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(s.paused).toBe(false);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(s.active).toBe(4);
  });

  it('never ticks when disabled', () => {
    let s;
    render(<Harness steps={4} enabled={false} onState={(x) => { s = x; }} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(s.active).toBe(0);
    expect(s.running).toBe(false);
  });
});
