import { useState, useRef, useEffect } from 'react';

// Behaves like a normal mailto: link, but ALSO copies the address to the
// clipboard on click and shows a brief "Copied!" tooltip. This way, if the
// visitor's device has no default mail app wired up (common on laptops that
// only use webmail), they still walk away with the address ready to paste.
export default function EmailLink({ email, className = '', children }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = () => {
    // Fire the copy but never block the mailto: navigation.
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  };

  return (
    <a
      href={`mailto:${email}`}
      className={`email-link ${className}`}
      onClick={handleClick}
    >
      {children || email}
      <span className={`email-copied ${copied ? 'is-visible' : ''}`} aria-hidden={!copied}>
        Copied!
      </span>
    </a>
  );
}
