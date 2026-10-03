"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

// knobs
const CELL = 16;
const T = { cover: 0.85, reveal: 0.9 };
const SEATS = 48;
const GREENS = ["#0dbc79", "#0a8f5d", "#075f3d"]; // same palette as PixelCard
const DARK = "#020604";
const OFF = "#1a1a1a";
const seatColor = (p: number) => (p < 0.6 ? "#0dbc79" : p < 0.85 ? "#e5e510" : "#cd3131"); // same thresholds as the deck HUD
const CYN = ["#11a8cd", "#0d82a0", "#095a70"];
const RED = ["#cd3131", "#8f2323", "#5f1717"];
const YEL = ["#e5e510", "#a8a80b", "#6f6f07"];
const BLU = ["#2472c8", "#1a5494", "#113963"];
type Boot = { cmd: string; lines: string[]; dir: "fill" | "drain"; pal?: string[]; board?: boolean };

// a knight visits every square once (Warnsdorff); the loader is that walk
const TOUR = (() => {
  const nb = (s: number) => [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].map(([r, c]) => [(s >> 3) + r, (s & 7) + c]).filter(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8).map(([r, c]) => r * 8 + c);
  const seen = new Set([0]), path = [0];
  for (let s = 0; path.length < 64;) {
    const free = (x: number) => nb(x).filter((y) => !seen.has(y)).length;
    const n = nb(s).filter((x) => !seen.has(x)).sort((a, b) => free(a) - free(b))[0];
    if (n === undefined) break;
    seen.add(n); path.push(n); s = n;
  }
  return path;
})();
const boots: Record<string, Boot> = {
  "/current": { cmd: "cd ~/research && cat gamma", lines: ["queue open", "boarding", "wait, or sail?"], dir: "fill" },
  "/": { cmd: "cd ~", lines: ["ferry docked", "the pier is quiet"], dir: "drain" },
  "/projects/des-gpu-queueing-model": { cmd: "cd ~/research && cat gamma", lines: ["queue open", "boarding", "wait, or sail?"], dir: "fill" },
  "/projects/des-gpu-queueing-model>/": { cmd: "cd ~", lines: ["ferry docked", "the pier is quiet"], dir: "drain" },
  "/projects/chess-engine": { cmd: "cd ~/chess-engine && python main.py", lines: ["no library to blame", "one knight, every square"], dir: "fill", pal: RED, board: true },
  "/projects/chess-engine>/": { cmd: "cd ~", lines: ["board folded", "pieces back in the box"], dir: "drain", pal: RED, board: true },
  "/projects/neural-network-in-c": { cmd: "cmake --build build && ctest", lines: ["matrices allocated", "weights in [-1, 1]", "all tests passed"], dir: "fill", pal: YEL },
  "/projects/neural-network-in-c>/": { cmd: "network_free(network);", lines: ["layers freed", "memory returned"], dir: "drain", pal: YEL },
  "/projects/p2pchat": { cmd: "cd ~/p2pchat && ./p2pchat", lines: ["checking UPnP...", "asking the router for a door", "connected"], dir: "fill", pal: CYN },
  "/projects/p2pchat>/": { cmd: "exit", lines: ["receiver joined", "sockets closed"], dir: "drain", pal: CYN },
  "/projects/mc-console": { cmd: "cd ~/mc-console && npm start", lines: ["tailing session.log", "token required", "listening on :3000"], dir: "fill", pal: BLU },
  "/projects/mc-console>/": { cmd: "tmux detach", lines: ["sockets closed", "session still running"], dir: "drain", pal: BLU },
};
const fallback: Boot = { cmd: "cd ..", lines: ["one moment"], dir: "fill" };

type Cell = { x: number; y: number; t: number; col: string; r: number };
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const SCROLL_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];

export function Gate() {
  const router = useRouter();
  const pathname = usePathname();
  const ov = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const term = useRef<HTMLDivElement>(null);
  const cmdEl = useRef<HTMLSpanElement>(null);
  const pctEl = useRef<HTMLParagraphElement>(null);
  const lineEls = useRef<HTMLParagraphElement[]>([]);
  const seatEls = useRef<HTMLSpanElement[]>([]);
  const boardEls = useRef<HTMLSpanElement[]>([]);
  const seatWrap = useRef<HTMLDivElement>(null);
  const boardWrap = useRef<HTMLDivElement>(null);
  const api = useRef<{ settle: () => void } | null>(null);
  const pending = useRef<{ path: string; done: () => void } | null>(null);
  const busy = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // plain Next navigation
    const o = ov.current!, c = cv.current!, ctx = c.getContext("2d")!;
    const S = { c: 0, mode: "in" as "in" | "out" };
    let cells: Cell[] = [];

    let pal = GREENS;
    const build = (ox: number, oy: number) => {
      const W = innerWidth, H = innerHeight;
      c.width = W;
      c.height = H;
      const maxD = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy));
      cells = [];
      for (let x = 0; x < W; x += CELL)
        for (let y = 0; y < H; y += CELL) {
          const d = Math.hypot(x + CELL / 2 - ox, y + CELL / 2 - oy);
          cells.push({ x, y, t: (d / maxD) * 0.82 + Math.random() * 0.18, col: pal[(Math.random() * pal.length) | 0], r: Math.random() });
        }
    };

    // "in": pixels flood outward from the click, a green front trailing into black.
    // "out": pixels burn away from the centre, green at the edge of the hole.
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const cc = S.c, inn = S.mode === "in";
      for (const p of cells) {
        const pres = inn ? clamp((cc - p.t) * 6) : clamp(1 + (p.t - cc) * 6);
        if (pres <= 0) continue;
        if (Math.random() < 0.004) p.r = Math.random();
        const hot = inn ? cc - p.t < 0.3 : p.t - cc < 0.3;
        ctx.fillStyle = hot || p.r < 0.04 ? p.col : DARK;
        const s = CELL * pres, off = (CELL - s) / 2, e = pres >= 1 ? 1 : 0;
        ctx.fillRect(p.x + off, p.y + off, s + e, s + e);
      }
    };
    const show = () => { o.style.display = "block"; gsap.ticker.add(draw); };
    const hide = () => { gsap.ticker.remove(draw); o.style.display = "none"; };

    const resetTerm = (b: Boot) => {
      gsap.set(term.current, { opacity: 0, y: 0 });
      cmdEl.current!.textContent = "";
      lineEls.current.forEach((l, i) => { l.textContent = b.lines[i] ?? ""; gsap.set(l, { opacity: 0 }); });
      seatEls.current.forEach((s) => (s.style.background = OFF));
      boardEls.current.forEach((s, i) => (s.style.background = ((i >> 3) + i) % 2 ? "#161616" : "#0c0c0c"));
      seatWrap.current!.style.display = b.board ? "none" : "flex";
      boardWrap.current!.style.display = b.board ? "grid" : "none";
      pctEl.current!.textContent = "";
    };

    // the loader is the ferry: seats fill green to yellow to red, or drain on the way back
    const paintBar = (p: number, b: Boot) => {
      const level = b.dir === "fill" ? p : 1 - p;
      if (b.board) {
        const n = Math.round(level * TOUR.length), cur = TOUR[n - 1];
        boardEls.current.forEach((s, i) => { const k = TOUR.indexOf(i); s.style.background = i === cur ? "#fff" : k >= 0 && k < n ? (b.pal ?? GREENS)[0] : ((i >> 3) + i) % 2 ? "#161616" : "#0c0c0c"; });
        pctEl.current!.textContent = `${n}/64`;
        pctEl.current!.style.color = (b.pal ?? GREENS)[0];
        return;
      }
      const on = Math.round(level * SEATS);
      seatEls.current.forEach((s, i) => (s.style.background = i < on ? seatColor(i / SEATS) : OFF));
      pctEl.current!.textContent = `deck ${Math.round(level * 100)}%`;
      pctEl.current!.style.color = seatColor(level);
    };

    const boot = (b: Boot) => {
      const tl = gsap.timeline();
      const ty = { n: 0 }, bar = { p: 0 };
      tl.set(term.current, { opacity: 1 })
        .to(ty, { n: b.cmd.length, duration: b.cmd.length * 0.016, ease: "none", onUpdate: () => { cmdEl.current!.textContent = b.cmd.slice(0, Math.ceil(ty.n)); } })
        .to(lineEls.current.slice(0, b.lines.length), { opacity: 1, duration: 0.01, stagger: 0.14 }, ">0.05")
        .to(bar, { p: 1, duration: 0.8, ease: "power1.inOut", onUpdate: () => paintBar(bar.p, b) }, "<");
      return tl;
    };

    const reveal = () => {
      gsap.to(term.current, { opacity: 0, y: -12, duration: 0.25, ease: "power2.in" });
      build(innerWidth / 2, innerHeight / 2); // keeps the palette of the page we just covered with
      S.mode = "out";
      S.c = -0.3;
      draw(); // paint before the browser does, so there is never a bare frame
      gsap.to(S, {
        c: 1.2, duration: T.reveal, delay: 0.12, ease: "power2.inOut",
        onComplete: () => { hide(); busy.current = false; pending.current = null; },
      });
    };

    const run = (href: string, ox: number, oy: number) => {
      const url = new URL(href, location.href);
      const b = boots[location.pathname + ">" + url.pathname] ?? boots[url.pathname] ?? fallback;
      busy.current = true;
      resetTerm(b);
      pal = b.pal ?? GREENS;
      build(ox, oy);
      S.mode = "in";
      S.c = 0;
      show();
      const ready = new Promise<void>((res) => {
        pending.current = { path: url.pathname, done: () => setTimeout(res, 280) }; // let Lenis land on the hash and ScrollTrigger refresh
        setTimeout(res, 7000); // never trap the visitor
      });
      const tl = gsap.timeline();
      const covered = new Promise<void>((res) => tl.eventCallback("onComplete", () => res()));
      tl.to(S, { c: 1.45, duration: T.cover, ease: "power2.inOut" })
        .add(() => router.push(url.pathname + url.search + url.hash), T.cover * 0.55) // route loads while we are covering
        .add(boot(b), T.cover * 0.6);
      Promise.all([covered, ready]).then(reveal);
    };

    // back / forward / anything we did not start: still burn the new page in
    api.current = {
      settle: () => { busy.current = true; pal = GREENS; resetTerm(fallback); show(); reveal(); },
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return; // same page: native hash behaviour
      e.preventDefault(); // Next's Link sees defaultPrevented and stays out of the way
      if (busy.current) return;
      let x = e.clientX, y = e.clientY;
      if (e.detail === 0) { const r = a.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      run(url.href, x, y);
    };
    const stop = (e: Event) => { if (busy.current) e.preventDefault(); };
    const stopKeys = (e: KeyboardEvent) => { if (busy.current && SCROLL_KEYS.includes(e.key)) e.preventDefault(); };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", stopKeys, true);
    o.addEventListener("wheel", stop, { passive: false });
    o.addEventListener("touchmove", stop, { passive: false });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", stopKeys, true);
      o.removeEventListener("wheel", stop);
      o.removeEventListener("touchmove", stop);
      gsap.killTweensOf([S, term.current]);
      hide();
      api.current = null;
      busy.current = false;
    };
  }, [router]);

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (pending.current) { if (pending.current.path === pathname) pending.current.done(); return; }
    if (!busy.current) api.current?.settle();
  }, [pathname]);

  return (
    <div ref={ov} data-lenis-prevent aria-hidden style={{ display: "none" }} className="fixed inset-0 z-70 bg-transparent">
      <canvas ref={cv} className="absolute inset-0 h-full w-full" />
      <div ref={term} className="absolute bottom-0 left-0 w-full px-6 pb-16 text-sm opacity-0 md:px-16">
        <p className="cursor text-foreground"><span className="text-dim">granted07@kolkata:~$ </span><span ref={cmdEl} /></p>
        <div className="mt-3 space-y-1" style={{ color: "#0dbc79" }}>
          {[0, 1, 2].map((i) => <p key={i} ref={(el) => { if (el) lineEls.current[i] = el; }} />)}
        </div>
        <div ref={boardWrap} className="mt-6 grid-cols-8" style={{ display: "none", width: "min(44vw, 176px)" }}>
          {Array.from({ length: 64 }, (_, i) => (
            <span key={i} ref={(el) => { if (el) boardEls.current[i] = el; }} className="aspect-square" />
          ))}
        </div>
        <div ref={seatWrap} className="mt-6 flex max-w-lg gap-0.75">
          {Array.from({ length: SEATS }, (_, i) => (
            <span key={i} ref={(el) => { if (el) seatEls.current[i] = el; }} className="h-3 flex-1" style={{ background: OFF }} />
          ))}
        </div>
        <p ref={pctEl} className="mt-2 text-xs" />
      </div>
    </div>
  );
}
