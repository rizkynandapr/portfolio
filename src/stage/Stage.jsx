import './Stage.css';

// The single scroll host. Chapters flow at natural height — nothing pins.
export default function Stage({ children }) {
  return <main className="stage">{children}</main>;
}
