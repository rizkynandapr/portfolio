// Shared by the diagram and the prose panes so the two can never disagree
// about which node is active or flagged.
export default function nodeState(i, activeIndex, flagIndex) {
  if (i !== activeIndex) return 'dim';
  return i === flagIndex ? 'flag' : 'active';
}
