export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-20 text-center">
      <p className="font-serif text-2xl text-foreground/80">{title}</p>
      {hint ? <p className="mt-2 text-xs text-taupe/50">{hint}</p> : null}
    </div>
  );
}