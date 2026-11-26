import './CloverMark.css';

// One heart-shaped leaf, built from two circles and their outer tangents to
// a tip at the centre, then turned five times. Drawn in currentColor so the
// mark follows whatever tile it sits on.
const LEAF = 'M50.00 47.50 L38.52 30.21 L38.13 29.54 L37.82 28.83 L37.59 28.09 L37.45 27.33 L37.40 26.56 L37.44 25.79 L37.57 25.02 L37.78 24.28 L38.08 23.57 L38.46 22.89 L38.91 22.26 L39.43 21.69 L40.02 21.19 L40.66 20.75 L41.34 20.39 L42.06 20.12 L42.81 19.92 L43.58 19.82 L44.35 19.80 L45.12 19.88 L45.88 20.04 L46.61 20.29 L47.31 20.62 L47.97 21.03 L48.57 21.51 L49.12 22.06 L49.59 22.67 L50.00 23.33 L50.00 23.33 L50.41 22.67 L50.88 22.06 L51.43 21.51 L52.03 21.03 L52.69 20.62 L53.39 20.29 L54.12 20.04 L54.88 19.88 L55.65 19.80 L56.42 19.82 L57.19 19.92 L57.94 20.12 L58.66 20.39 L59.34 20.75 L59.98 21.19 L60.57 21.69 L61.09 22.26 L61.54 22.89 L61.92 23.57 L62.22 24.28 L62.43 25.02 L62.56 25.79 L62.60 26.56 L62.55 27.33 L62.41 28.09 L62.18 28.83 L61.87 29.54 L61.48 30.21Z';

export default function CloverMark({ size = 24 }) {
  return (
    <svg className="clover" width={size} height={size} viewBox="17.5 19 65 65" aria-hidden="true">
      <g className="clover-leaves" transform="translate(0 1.5)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path key={deg} d={LEAF} fill="currentColor" transform={`rotate(${deg} 50 50)`} />
        ))}
      </g>
      <circle className="clover-core" cx="50" cy="51.5" r="4.4" />
    </svg>
  );
}
