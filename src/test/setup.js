import '@testing-library/jest-dom/vitest';

// jsdom has no matchMedia. Default to "motion allowed"; individual tests override.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
