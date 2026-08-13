// TalentScout — two inputs sit side by side at the top, meet, then run as one
// chain down the centre. The chain descends rather than running across, because
// the diagram column is tall and narrow: a horizontal chain would stack its
// labels on one line. Nodes 0 and 1 are the inputs; everything after is chain.
export default function convergent(nodes, viewport) {
  const leftX = viewport.width * 0.18;
  const rightX = viewport.width * 0.62;
  const chainX = viewport.width * 0.32;
  const topY = viewport.height * 0.08;
  // The two inputs sit on their own rows. They read as parallel because they
  // occupy different columns above the merge; putting them on one row would
  // collide their labels in a column this narrow.
  const inputGap = viewport.height * 0.09;
  const chainTop = topY + inputGap * 2;
  const spanY = viewport.height * 0.88 - chainTop;
  const chainCount = Math.max(nodes.length - 2, 1);

  return nodes.map((n, i) => {
    if (i < 2) {
      return { ...n, x: i === 0 ? leftX : rightX, y: topY + i * inputGap, edge: null };
    }
    const k = i - 2;
    return {
      ...n,
      x: chainX,
      y: chainTop + spanY * ((k + 1) / chainCount),
      edge: k === 0 ? 'merge' : 'straight',
    };
  });
}
