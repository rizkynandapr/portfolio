import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Scroll distance spent per slot, as a fraction of the viewport height.
// Under half a screen per node, so a nine-node trace costs ~4.5 screens.
export const SLOT_VH = 0.45;

// Pins a chapter and reports which step the scroll position lands on.
// Scroll is divided into steps + 1 slots: slot 0 is the lead-in screen where
// the chapter title holds, then one slot per node. Returns 0 and registers
// nothing when disabled (mobile, or prefers-reduced-motion) — the caller
// renders statically.
export default function useChapter({ ref, steps, enabled }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!enabled || !ref.current || steps < 1) return;

    const slots = steps + 1;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: () => `+=${Math.round(slots * SLOT_VH * window.innerHeight)}`,
      invalidateOnRefresh: true,
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const slot = Math.min(slots - 1, Math.floor(self.progress * slots));
        setActive(Math.max(0, slot - 1)); // slot 0 is the lead-in; node 0 holds
      },
    });

    return () => trigger.kill();
  }, [ref, steps, enabled]);

  return active;
}
