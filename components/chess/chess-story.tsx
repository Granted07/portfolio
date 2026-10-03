"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import { start, legal, make, inCheck, hashHex, type Pos, type Stats } from "@/lib/chess/engine";

const Landscape = dynamic(() => import("./landscape"), { ssr: false });
gsap.registerPlugin(ScrollTrigger);

const RED = "#cd3131";
const GLYPH = ["", "♟", "♞", "♝", "♜", "♛", "♚"];
const THEMES = [ // the three from config.py, press t
  { l: "rgb(167,216,232)", d: "rgb(36,166,209)" },
  { l: "rgb(234,235,200)", d: "rgb(119,154,88)" },
  { l: "rgb(120,119,118)", d: "rgb(86,85,84)" },
];
const PIECES = ["P", "N", "B", "R", "Q", "K"];
const NAME: Record<string, string> = { P: "pawn", N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king" };
const fmt = (n: number) => n.toLocaleString("en-US");

const ask = (p: Pos, prune: boolean, depth: number, ms: number, onDepth?: (s: Stats) => void) =>
  new Promise<Stats>((res) => {
    const w = new Worker(new URL("../../lib/chess/engine.worker.ts", import.meta.url));
    w.onmessage = (e) => { if (e.data.type === "depth") onDepth?.(e.data); else { res(e.data); w.terminate(); } };
    w.postMessage({ b: Array.from(p.b), side: p.side, cr: p.cr, ep: p.ep, depth, ms, prune });
  });

const Code = ({ children }: { children: string }) => (
  <pre className="rv w-fit max-w-full overflow-x-auto border-l-2 bg-black/60 px-4 py-3 text-xs text-foreground/80 md:text-sm" style={{ borderColor: RED }}>{children}</pre>
);

export function ChessStory() {
  const root = useRef<HTMLDivElement>(null);
  const pos = useRef<Pos>(start());
  const locked = useRef(false);
  const [piece, setPiece] = useState("N");
  const [dim, setDim] = useState(false);
  const [, bump] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [last, setLast] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [theme, setTheme] = useState(0);
  const [prune, setPrune] = useState(true);
  const [hud, setHud] = useState<Stats | null>(null);
  const [cmp, setCmp] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hi", { y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" });
        gsap.utils.toArray<HTMLElement>(".rv").forEach((el) =>
          gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 62%", scrub: true } }),
        );
      });
      // scrolling through this section walks the landscape pawn -> king
      ScrollTrigger.create({
        trigger: ".land", start: "top top", end: "bottom bottom",
        onUpdate: (s) => { if (!locked.current) setPiece(PIECES[Math.min(5, Math.floor(s.progress * 6))]); },
        onLeave: () => (locked.current = false), onLeaveBack: () => (locked.current = false),
      });
      ScrollTrigger.create({ trigger: "#play", start: "top 70%", end: "bottom 30%", onToggle: (s) => setDim(s.isActive) });
    }, root);
    return () => ctx.revert();
  }, []);

  const reply = useCallback(async () => {
    const p = pos.current, ms = legal(p);
    if (!ms.length) return setStatus(inCheck(p, p.side) ? "checkmate. you win." : "stalemate.");
    setBusy(true);
    const r = await ask(p, prune, prune ? 4 : 3, 3000, setHud); // main.py: depth 4, 3 seconds
    const mv = (r.best && ms.find((m) => m.f === r.best!.f && m.t === r.best!.t)) || ms[0];
    make(p, mv);
    setHud(r); setLast([mv.f, mv.t]); setBusy(false); bump((n) => n + 1);
    if (!legal(p).length) setStatus(inCheck(p, p.side) ? "checkmate. engine wins." : "stalemate.");
  }, [prune]);

  const click = (s: number) => {
    const p = pos.current;
    if (busy || status || p.side !== 1) return;
    const mv = sel !== null ? legal(p).find((m) => m.f === sel && m.t === s) : undefined;
    if (mv) { make(p, mv); setSel(null); setLast([mv.f, mv.t]); bump((n) => n + 1); void reply(); }
    else setSel(p.b[s] > 0 ? s : null);
  };
  const reset = () => { if (busy) return; pos.current = start(); setSel(null); setLast([]); setStatus(""); setHud(null); setCmp(""); bump((n) => n + 1); };
  const compare = async () => {
    if (busy) return;
    setBusy(true); setCmp("counting…");
    const a = await ask(pos.current, true, 3, 6000), b = await ask(pos.current, false, 3, 6000);
    setCmp(`${fmt(a.nodes)} positions looked at, or ${fmt(b.nodes)}  (${(b.nodes / a.nodes).toFixed(0)}×)`);
    setBusy(false);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "t") setTheme((t) => (t + 1) % 3); if (e.key === "r") reset(); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  });

  const p = pos.current, th = THEMES[theme];
  const targets = new Set(sel !== null ? legal(p).filter((m) => m.f === sel).map((m) => m.t) : []);

  return (
    <div ref={root} className="relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700" style={{ opacity: dim ? 0.07 : 0.85 }}>
        <Landscape piece={piece} />
      </div>

      <div className="relative z-10">
        <section className="flex min-h-screen flex-col justify-end px-6 pb-16 md:px-16">
          <p className="hi text-dim"><Scramble text="granted07@kolkata:~/chess-engine$ python main.py" /></p>
          <h1 className="hi mt-6 text-[clamp(3rem,12vw,11rem)] font-medium leading-[.9] tracking-tighter">chess-engine</h1>
          <p className="hi mt-6 max-w-xl text-lg text-foreground/70">No chess library. Every rule written out by hand, then taught to look ahead.</p>
          <p className="hi cursor mt-16 text-sm" style={{ color: RED }}>scroll</p>
        </section>

        <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-32 text-xl md:text-3xl">
          <p className="rv">A pawn has a first step, a diagonal, and one move that only exists for a single turn.</p>
          <Code>{"if p.en_passant:   # true for exactly one move"}</Code>
          <p className="rv">The first time I asked whether a move leaves my king in check, I copied the whole board and played it out. Then I generated every reply, to see if one of them took the king.</p>
          <Code>{"temp_board = copy.deepcopy(self)"}</Code>
          <p className="rv">The engine that thinks does it differently. Move, look, move back. Nothing is copied.</p>
          <Code>{"undo, h = make_move(board, move, promo, colour)\n...\nundo_move(board, move, undo)"}</Code>
        </section>

        <section className="land relative h-[420vh]">
          <div className="sticky top-0 flex h-screen flex-col justify-end gap-6 px-6 pb-16 md:px-16">
            <p className="text-dim">engine/minimax.py → PST</p>
            <p className="max-w-md text-xl md:text-2xl">Every piece has a number for every square. The engine goes where the numbers are tallest.</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Piece">
              {PIECES.map((k) => (
                <button key={k} onClick={() => { locked.current = true; setPiece(k); }} aria-pressed={piece === k}
                  className="border px-3 py-1 text-sm transition-colors" style={{ borderColor: piece === k ? RED : "#333", color: piece === k ? RED : "#a1a1aa" }}>
                  {NAME[k]}
                </button>
              ))}
            </div>
            <p className="text-sm text-dim">white above the plane, red below it</p>
          </div>
        </section>

        <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-32 text-xl md:text-3xl">
          <p className="rv">It looks one move ahead, then two, then three, then four. If three seconds run out, it plays the best it had.</p>
          <p className="rv">Most of the work is knowing what not to look at.</p>
          <p className="rv">Every position gets a fingerprint. A move changes it with a few XORs, so the engine can tell when it has been somewhere before.</p>
        </section>

        <section id="play" className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-[minmax(0,560px)_1fr] md:px-16">
          <div>
            <div className="grid aspect-square w-full grid-cols-8 border border-white/20" style={{ maxWidth: 560 }}>
              {Array.from(p.b).map((v, s) => {
                const dark = ((s >> 3) + (s & 7)) % 2 === 1;
                return (
                  <button key={s} onClick={() => click(s)} aria-label={`square ${s}`}
                    className="w-full h-full aspect-square relative flex items-center justify-center text-[clamp(1.4rem,6.5vw,3rem)] leading-none"
                    style={{ background: dark ? th.d : th.l, outline: sel === s ? "3px solid #fff" : last.includes(s) ? `2px solid ${RED}` : "none", outlineOffset: -3,
                      color: v > 0 ? "#fff" : "#000", textShadow: v > 0 ? "0 0 3px #000, 0 0 3px #000" : "none" }}>
                    {GLYPH[Math.abs(v)]}
                    {targets.has(s) && <span className="absolute h-3 w-3 rounded-full bg-black/45" />}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-dim">r reset · t theme</p>
          </div>

          <div className="flex flex-col gap-5 text-sm">
            <p className="text-lg">{status || (busy ? "thinking…" : "white to move")}</p>
            <pre className="min-h-[7.5rem] border-l-2 bg-black/60 px-4 py-3 leading-6 text-foreground/80" style={{ borderColor: RED }}>
{hud ? `depth ${hud.depth}   score ${hud.score >= 0 ? "+" : ""}${hud.score}
nodes ${fmt(hud.nodes)}
cutoffs ${fmt(hud.cutoffs)}   tt ${fmt(hud.ttHits)}
${Math.round(hud.ms)} ms` : "waiting for your move"}
{"\n"}hash {hashHex(p)}
            </pre>
            <label className="flex w-fit cursor-pointer items-center gap-3">
              <input type="checkbox" checked={prune} onChange={(e) => setPrune(e.target.checked)} className="h-4 w-4 accent-[#cd3131]" />
              skip hopeless branches
            </label>
            <button onClick={compare} disabled={busy} className="w-fit border-b pb-1 disabled:opacity-40" style={{ borderColor: RED, color: RED }}>run this position both ways</button>
            {cmp && <p className="text-foreground/80">{cmp}</p>}
          </div>
        </section>

        <footer className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end gap-3 px-6 pb-16 md:px-16">
          <a href="https://github.com/Granted07/Chess-Engine-Python" target="_blank" rel="noreferrer" className="w-fit text-3xl hover:underline md:text-6xl">read the code</a>
          <Link href="/#work" className="w-fit text-dim hover:text-white">← home</Link>
        </footer>
      </div>
    </div>
  );
}
