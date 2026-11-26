import { scramble } from './scramble.js';
import { prepareCount, runCount } from './countUp.js';

// What enters on scroll, and how. Kept as selectors in one place so chapters
// stay free of motion plumbing — remove a line here and that element simply
// renders static.
const TARGETS = [
  ['.chapter:not(.opening) .section-head', 'head'],
  ['.systems-title, .flow-brief-id, .compact-grid > div:first-child, .stackexp-title, .about-title, .contact-title', 'rise'],
  ['.flow-brief-prose, .compact-grid > div:last-child, .about-story, .about-now, .contact-lead, .contact-actions', 'rise-late'],
  ['.flow-trace', 'board'],
  ['.systems-list, .about-principles, .stackexp-groups, .stackexp-roles, .contact-links', 'stagger'],
];

const COUNTERS = '.telemetry-value, .portrait-chip-value, .systems-metric-value, .flow-brief-metric-value, .compact-metric-value, .about-now-metrics dd';

// Tags targets synchronously (call from a layout effect so nothing flashes),
// then reveals each one the first time it scrolls into view.
export function startReveal(root = document) {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const tagged = [];
  for (const [selector, kind] of TARGETS) {
    root.querySelectorAll(selector).forEach((el) => {
      if (el.dataset.reveal) return;
      el.dataset.reveal = kind;
      if (kind === 'stagger') {
        [...el.children].forEach((child, i) => child.style.setProperty('--i', Math.min(i, 12)));
      }
      tagged.push(el);
    });
  }

  const counters = [...root.querySelectorAll(COUNTERS)].map(prepareCount).filter(Boolean);
  const cancels = [];

  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.dataset.in = '';
      revealIO.unobserve(el);
      if (el.dataset.reveal === 'head') {
        const title = el.querySelector('.section-head-title');
        if (title) cancels.push(scramble(title, { delay: 120 }));
      }
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  const countIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const c = counters.find((x) => x.el === e.target);
      countIO.unobserve(e.target);
      if (c) cancels.push(runCount(c));
    }
  }, { threshold: 0.6 });

  tagged.forEach((el) => revealIO.observe(el));
  counters.forEach((c) => countIO.observe(c.el));

  return () => {
    revealIO.disconnect();
    countIO.disconnect();
    cancels.forEach((fn) => fn());
    counters.forEach((c) => c.restore());
    tagged.forEach((el) => {
      delete el.dataset.reveal;
      delete el.dataset.in;
    });
  };
}
