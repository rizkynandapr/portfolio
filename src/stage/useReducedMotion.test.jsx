import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useReducedMotion from './useReducedMotion.js';

function mockMatchMedia(matches) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener,
    removeEventListener,
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => { vi.restoreAllMocks(); });

describe('useReducedMotion', () => {
  it('returns false when motion is allowed', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the user asked for reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('subscribes to media query changes', () => {
    mockMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());
    const mql = window.matchMedia.mock.results[0].value;
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
