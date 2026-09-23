// [02] // SYSTEMS INDEX ———————————— meta
export default function SectionHead({ index, title, meta, id }) {
  return (
    <div className="section-head mono" id={id}>
      <span><span className="section-head-index">[{index}]</span> // {title}</span>
      <span className="section-head-rule" aria-hidden="true" />
      {meta && <span className="section-head-meta">{meta}</span>}
    </div>
  );
}
