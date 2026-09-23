import { useEffect, useRef, useState } from 'react';

// A mailto link that also copies the address, for visitors whose machine has
// no mail client wired up. Copy never blocks the mailto navigation.
export default function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = () => {
    navigator.clipboard?.writeText(email).then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };

  return (
    <a href={`mailto:${email}`} onClick={onClick} className="btn btn-primary">
      {email}
      <span className="mono" aria-live="polite">{copied ? '· copied' : ''}</span>
    </a>
  );
}
