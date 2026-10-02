const items = ["research", "work", "git", "contact"];
export function Nav() {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-black/70 px-6 py-4 text-xs backdrop-blur-sm md:px-16">
      <a href="#top" className="text-foreground">~/anjishnu</a>
      <ul className="flex gap-5 md:gap-8">
        {items.map((i) => (
          <li key={i}><a href={`#${i}`} className="text-dim transition-colors hover:text-[var(--green)]">{i}</a></li>
        ))}
      </ul>
    </nav>
  );
}