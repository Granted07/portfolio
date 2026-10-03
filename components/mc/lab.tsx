"use client";
import { useEffect, useRef, useState } from "react";

const B = "#2472c8", G = "#0dbc79", R = "#cd3131";
const WINDOW = 10000, MAX = 5, LIMIT = 256; // the README defaults
const CONTROL = /[\u0000-\u0008\u000A-\u001F\u007F]/; // same pattern as app/api/command/route.ts
const gates = [
  ["token", "does the Bearer token match?"],
  ["rate limit", "5 commands per 10 seconds"],
  ["not empty", "after trimming"],
  ["short enough", "256 characters at most"],
  ["plain text", "no control characters"],
  ["tmux", "hand it to the server"],
];
export const ambient = [
  "Steve joined the game", "Alex has made the advancement [Stone Age]", "Saving the game (this may take a moment!)",
  "Saved the game", "<Alex> anyone seen my pickaxe?", "Steve lost connection: Disconnected",
];
export const line = (s: string) => `[${new Date().toTimeString().slice(0, 8)}] [Server thread/INFO]: ${s}`;
const presets = [["say hello", "say hello"], ["list", "list"], ["nothing", "   "], ["very long", "x".repeat(300)], ["two lines", "say hi\nstop"], ["stop", "stop"]];

type Res = { fail: number; msg: string; shown: number; sent: string };

export function Lab() {
  const [good, setGood] = useState(true);
  const [cmd, setCmd] = useState("say hello");
  const [up, setUp] = useState(true);
  const [out, setOut] = useState(['[12:00:00] [Server thread/INFO]: Done (4.2s)! For help, type "help"']);
  const [res, setRes] = useState<Res | null>(null);
  const lim = useRef({ start: 0, count: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const upRef = useRef(true);
  const box = useRef<HTMLPreElement>(null);
  upRef.current = up;
  const add = (...l: string[]) => setOut((o) => [...o, ...l].slice(-40));

  useEffect(() => {
    const id = setInterval(() => { if (upRef.current) add(line(ambient[(Math.random() * ambient.length) | 0])); }, 2600);
    return () => { clearInterval(id); timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => { box.current?.scrollTo(0, 1e6); }, [out]);

  const dispatch = (c: string) => {
    const r = c.startsWith("say ") ? `[Server] ${c.slice(4)}` : c === "list" ? "There are 0 of a max of 20 players online:" : c === "stop" ? "Stopping the server" : "Unknown or incomplete command, see below for error";
    add(`> ${c}`, line(r));
    if (c === "stop") setUp(false);
  };

  const send = () => {
    if (!up) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    const now = Date.now(), L = lim.current, c = cmd.replace(/\r/g, "").trim();
    let fail = -1, msg = "";
    if (!good) { fail = 0; msg = "401 Unauthorized"; }
    else {
      if (now - L.start >= WINDOW) { L.start = now; L.count = 0; } // the limiter runs before the command is even looked at
      L.count++;
      if (L.count > MAX) { fail = 1; msg = `429 Rate limit exceeded. Retry in ${Math.ceil((L.start + WINDOW - now) / 1000)} s`; }
      else if (!c) { fail = 2; msg = "400 Command cannot be empty"; }
      else if (c.length > LIMIT) { fail = 3; msg = "400 Command is too long"; }
      else if (CONTROL.test(c)) { fail = 4; msg = "400 Command contains unsupported control characters"; }
    }
    const n = fail < 0 ? gates.length : fail + 1;
    setRes({ fail, msg, shown: 0, sent: c });
    for (let i = 1; i <= n; i++) timers.current.push(setTimeout(() => setRes((r) => r && { ...r, shown: i }), i * 130));
    if (fail < 0) timers.current.push(setTimeout(() => dispatch(c), n * 130 + 150));
  };

  const toggle = () => { if (up) { add("> stop", line("Stopping the server")); setUp(false); } else { add("> ./run.sh", line("Starting minecraft server")); setUp(true); } };
  const btn = "border px-3 py-1 text-sm transition-colors";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:px-16">
      <div className="flex flex-col gap-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 shrink-0 text-dim">token</span>
          {[true, false].map((v) => (
            <button key={String(v)} onClick={() => setGood(v)} aria-pressed={good === v} className={btn} style={{ borderColor: good === v ? B : "#333", color: good === v ? B : "#a1a1aa" }}>{v ? "right one" : "wrong one"}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 shrink-0 text-dim">try</span>
          {presets.map(([l, v]) => <button key={l} onClick={() => setCmd(v)} className={btn} style={{ borderColor: "#333" }}>{l}</button>)}
        </div>
        <textarea value={cmd} onChange={(e) => setCmd(e.target.value)} rows={2} disabled={!up} aria-label="Command"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={up ? "type a command" : "server is stopped"} className="resize-none border border-white/20 bg-black px-3 py-2 disabled:opacity-40" />
        <div className="flex flex-wrap gap-2">
          <button onClick={send} disabled={!up} className={`${btn} disabled:opacity-40`} style={{ borderColor: B, color: B }}>send</button>
          <button onClick={toggle} className={btn} style={{ borderColor: up ? R : G, color: up ? R : G }}>{up ? "stop server" : "start server"}</button>
        </div>

        <ol className="mt-2 flex flex-col" aria-label="Checks, in order">
          {gates.map(([n, s], i) => {
            const state = !res || i > res.shown ? "idle" : i === res.shown ? "wait" : res.fail === i ? "fail" : "pass";
            const c = state === "pass" ? G : state === "fail" ? R : "#707070";
            return (
              <li key={n} className="flex items-baseline gap-3 border-l-2 py-1.5 pl-4 transition-colors duration-200" style={{ borderColor: state === "idle" ? "#222" : c, opacity: state === "idle" ? 0.45 : 1 }}>
                <span className="w-4" style={{ color: c }}>{state === "pass" ? "✓" : state === "fail" ? "✕" : "·"}</span>
                <span className="w-28 shrink-0">{n}</span>
                <span className="text-xs text-dim">{s}</span>
              </li>
            );
          })}
        </ol>
        <p className="min-h-10 text-xs" style={{ color: res && res.fail >= 0 ? R : G }}>
          {res && res.shown >= (res.fail < 0 ? gates.length : res.fail + 1) ? (res.fail >= 0 ? res.msg : `tmux send-keys -t minecraft "${res.sent}" Enter`) : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs"><span className="text-dim">session.log</span><span style={{ color: up ? G : R }}>{up ? "● running" : "● stopped"}</span></div>
        <pre ref={box} className="h-80 overflow-y-auto border-l-2 bg-black/60 px-4 py-3 text-xs leading-6 text-foreground/80" style={{ borderColor: B }} aria-live="off">{out.join("\n")}</pre>
        <p className="text-xs text-dim">The checks and their order are the real ones. The server is not: nothing on this page is connected to a Minecraft server.</p>
      </div>
    </div>
  );
}