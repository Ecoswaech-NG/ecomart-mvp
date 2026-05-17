export function Description({ description }: { description: string }) {
  if (!description) {
    return <div className="w-full h-25 rounded-xl card-base animate-pulse" />;
  }
  return (
    <div className="card-base p-5">
      <h2 className="text-xs font-semibold text-muted mb-3 tracking-widest uppercase">
        Description
      </h2>
      <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}