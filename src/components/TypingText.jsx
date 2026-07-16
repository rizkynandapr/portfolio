import { useState, useEffect, useRef } from 'react';

// Types out each phrase, holds it, deletes it, then moves to the next —
// looping forever with a blinking cursor. If the visitor prefers reduced
// motion, it just shows the first phrase, statically, no animation.
//
// Layout stability: an invisible "ghost" of the longest phrase reserves the
// final width AND height of the pill, and the live text is absolutely
// positioned on top of it. Without this, the pill resizes on every keystroke
// and (on narrow screens) wraps to two lines mid-phrase — which shoves the
// whole page up and down once per type/delete cycle.
export default function TypingText({
  phrases,
  typeSpeed = 55,
  deleteSpeed = 28,
  holdTime = 1600,
}) {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const reduced = useRef(false);

  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), '');

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) {
      setText(phrases[0]);
    }
  }, [phrases]);

  useEffect(() => {
    if (reduced.current) return;

    const current = phrases[phraseIndex];
    let delay;

    if (!deleting && text === current) {
      // fully typed — hold, then start deleting
      delay = holdTime;
      const t = setTimeout(() => setDeleting(true), delay);
      return () => clearTimeout(t);
    }

    if (deleting && text === '') {
      // fully deleted — move to next phrase
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
      return;
    }

    delay = deleting ? deleteSpeed : typeSpeed;
    const t = setTimeout(() => {
      setText((prev) =>
        deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1)
      );
    }, delay);

    return () => clearTimeout(t);
  }, [text, deleting, phraseIndex, phrases, typeSpeed, deleteSpeed, holdTime]);

  return (
    <span className="typing-box">
      <span className="typing-ghost" aria-hidden="true">{longest}</span>
      <span className="typing-live">
        {text}
        <span className="typing-cursor" aria-hidden="true" />
      </span>
    </span>
  );
}
