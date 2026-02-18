export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
      {subtitle ? (
        <p className="text-sm md:text-base text-slate-600 mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}
