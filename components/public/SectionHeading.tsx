export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-10 md:mb-12">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <div className="text-center">
          {eyebrow ? (
            <p className="text-[10px] uppercase tracking-[0.35em] text-taupe/50">{eyebrow}</p>
          ) : null}
          <h2 className="mt-1 font-serif text-2xl text-foreground md:text-3xl">{title}</h2>
        </div>
        <div className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}