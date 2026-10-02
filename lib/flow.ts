export type Step = { tag: string; color: string; title: string; line: string; formula: string };

export const steps: Step[] = [
  { tag: "01 deck", color: "#0dbc79", title: "Look at the deck",
    line: "Every trip needs room. The deck is the GPU's memory, and other passengers may already be sitting on it.",
    formula: "p = 1 - free / total" },
  { tag: "02 dock", color: "#e5e510", title: "Look at the dock",
    line: "A long line means every extra minute of waiting costs more than it did a moment ago.",
    formula: "ρ = arrivals / what one trip can carry" },
  { tag: "03 crowd", color: "#bc3fbc", title: "Look at the crowd",
    line: "Fifty people trickling in is easy. Fifty arriving together is a different day.",
    formula: "V = (cₐ² + cₛ²) / (1 + cₛ²)" },
  { tag: "04 price", color: "#11a8cd", title: "Put a price on space",
    line: "One number, γ: how many milliseconds of waiting is one megabyte of deck worth right now? A tight deck makes space dear. A long line or a wild crowd makes it cheaper. Then smooth it, so the price never flickers.",
    formula: "γ = base · (1 + (G-1)·s(p)) / (1 + κ·V·ρ²)" },
  { tag: "05 rail", color: "#cd3131", title: "Keep the rail",
    line: "Whatever the price says, a hard limit stops the ferry from sinking. The price is a preference. The rail is a promise.",
    formula: "B_eff = min(B, ⌊(free - reserve - m₀) / k⌋)" },
  { tag: "06 plan", color: "#2472c8", title: "Ask the planner",
    line: "BatOpt, the published method this builds on, picks the trip size with the smallest waiting plus price times space.",
    formula: "b* = argmin E(W_b) + γ·(k·b + m₀)" },
  { tag: "07 again", color: "#ededed", title: "Then look again",
    line: "The size it chose becomes the starting point for the next look. Round and round.",
    formula: "b → next cycle" },
];

export const open = [
  "The starting numbers are educated guesses. Finding the right ones is the real work.",
  "The line may be counted twice. I am testing whether that part earns its place.",
  "The crowd fix is a patch, not a theory.",
  "All of it runs in a simulator first, on timings measured from a real GPU.",
];