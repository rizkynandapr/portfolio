// TalentScout — two inputs on the left meet, then run as one chain to the right.
// Nodes 0 and 1 are the inputs; everything after is the chain.
export default function convergent(nodes, viewport) {
  const inputX = viewport.width * 0.18;
  const chainStart = viewport.width * 0.32;
  const chainSpan = viewport.width * 0.48;
  const chainCount = Math.max(nodes.length - 2, 1);
  const step = chainCount > 1 ? chainSpan / (chainCount - 1) : 0;
  const midY = viewport.height / 2;

  return nodes.map((n, i) => {
    if (i < 2) {
      return {
        ...n,
        x: inputX,
        y: viewport.height * (i === 0 ? 0.33 : 0.67),
        edge: null,
      };
    }
    const k = i - 2;
    return {
      ...n,
      x: chainStart + k * step,
      y: midY,
      edge: k === 0 ? 'merge' : 'straight',
    };
  });
}
