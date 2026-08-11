export default function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="section-header">

      <div className="eyebrow">
        <span />
        {eyebrow}
      </div>

      <h2>{title}</h2>

      {description && (
        <p>{description}</p>
      )}

    </div>
  );
}