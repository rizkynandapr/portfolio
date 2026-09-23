import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import useChapter, { SLOT_VH } from './useChapter.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

vi.mock('gsap', () => ({ gsap: { registerPlugin: vi.fn() } }));
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { create: vi.fn() },
}));

function Harness({ steps, enabled, onActive }) {
  const ref = useRef(null);
  const active = useChapter({ ref, steps, enabled });
  onActive(active);
  return <div ref={ref} />;
}

describe('useChapter', () => {
  let killMock;

  beforeEach(() => {
    killMock = vi.fn();
    ScrollTrigger.create.mockReset();
    ScrollTrigger.create.mockImplementation(() => ({ kill: killMock }));
  });

  it('never registers a ScrollTrigger when disabled', () => {
    render(<Harness steps={8} enabled={false} onActive={() => {}} />);
    expect(ScrollTrigger.create).not.toHaveBeenCalled();
  });

  it('kills the trigger on unmount', () => {
    const { unmount } = render(<Harness steps={8} enabled onActive={() => {}} />);
    expect(ScrollTrigger.create).toHaveBeenCalledTimes(1);
    expect(killMock).not.toHaveBeenCalled();
    unmount();
    expect(killMock).toHaveBeenCalledTimes(1);
  });

  it('re-resolves the pin distance on resize instead of baking in innerHeight', () => {
    render(<Harness steps={8} enabled onActive={() => {}} />);
    const config = ScrollTrigger.create.mock.calls[0][0];
    // `end` must be a function so ScrollTrigger re-reads window.innerHeight
    // on refresh, rather than a string computed once at mount.
    expect(typeof config.end).toBe('function');
    expect(config.end()).toBe(`+=${Math.round(9 * SLOT_VH * window.innerHeight)}`);
    expect(config.invalidateOnRefresh).toBe(true);
  });

  it('maps scroll progress to the documented slot/active arithmetic', () => {
    // steps = 8 -> slots = 9. slot = min(slots-1, floor(progress*slots)),
    // active = max(0, slot-1) -- slot 0 is the lead-in screen, so node 0
    // holds through it.
    let latest;
    render(<Harness steps={8} enabled onActive={(a) => { latest = a; }} />);
    const { onUpdate } = ScrollTrigger.create.mock.calls[0][0];

    const cases = [
      [0, 0],
      [0.05, 0],
      [0.5, 3],
      [0.99, 7],
      [1.0, 7],
    ];

    for (const [progress, expected] of cases) {
      act(() => { onUpdate({ progress }); });
      expect(latest).toBe(expected);
      expect(latest).toBeGreaterThanOrEqual(0);
      expect(latest).toBeLessThanOrEqual(8 - 1); // active never exceeds steps - 1
    }
  });

  it('reaches the final node at progress 1 and never goes negative at progress 0', () => {
    let latest;
    render(<Harness steps={3} enabled onActive={(a) => { latest = a; }} />);
    const { onUpdate } = ScrollTrigger.create.mock.calls[0][0];

    act(() => { onUpdate({ progress: 0 }); });
    expect(latest).toBe(0);

    act(() => { onUpdate({ progress: 1 }); });
    expect(latest).toBe(3 - 1); // steps - 1, the last node
  });
});
