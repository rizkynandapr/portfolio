import '@testing-library/jest-dom/vitest';

// jsdom has no matchMedia. Default to "motion allowed"; individual tests override.
// Guarded so server-side test files running in the node environment load too.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
