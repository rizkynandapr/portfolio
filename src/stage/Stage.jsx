import './Stage.css';

// The single scroll host. Every chapter is a child; chapters that pin do so
// against this element's scroll, which is why there is no inner scroller.
export default function Stage({ children }) {
  return (
    <main className="stage">
      {children}
    </main>
  );
}
