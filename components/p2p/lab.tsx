"use client";
import { useEffect, useRef, useState } from "react";

const C = "#11a8cd", G = "#0dbc79", R = "#cd3131";
const PORT = 4000, PEER = "203.0.113.7";
type Phase = "idle" | "run" | "chat" | "done";
// main.cpp reads with a 1024 byte buffer, so one recv gives at most 1023 characters
const pieces = (s: string) => s.match(/[\s\S]{1,1023}/g) ?? [];
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

export function Lab() {
  const [upnp, setUpnp] = useState(true);
  const [wait, setWait] = useState(6);
  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [mine, setMine] = useState<string[]>([]);
  const [theirs, setTheirs] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => stop, []);
  const at = (ms: number, f: () => void) => { timers.current.push(setTimeout(f, ms)); };

  const run = () => {
    stop(); setLog([]); setMine([]); setTheirs([]); setPhase("run");
    let t = 0;
    const say = (s: string, dt = 350) => { t += dt; at(t, () => setLog((l) => [...l, s])); };
    say("Checking UPnP support...");
    if (!upnp) {
      say("Not available");
      say("Note: You may need to manually forward ports on your router");
      at(t + 200, () => setPhase("done"));
      return;
    }
    say("Available");
    say(`Enter your port: ${PORT}`, 250);
    say(`Enter peer's IP: ${PEER}`, 250);
    say(`Enter peer's port: ${PORT + 1}`, 250);
    say(`Port ${PORT} forwarded successfully`);
    say(`Attempting to connect to ${PEER}:${PORT + 1}`);
    for (let n = 1; n <= 30; n++) {
      if ((n - 1) * 2 >= wait) {
        say(`Connected to ${PEER}:${PORT + 1}`, 250);
        say("Connection established", 150);
        say("Type 'exit' to quit", 150);
        at(t + 100, () => setPhase("chat"));
        return;
      }
      say(`Attempt ${n} failed. Retrying in 2 seconds...`, 250); // 2 s of program time, played at 8x
    }
    say("Failed to establish connection");
    at(t + 200, () => setPhase("done"));
  };

  const send = () => {
    const m = msg.trim();
    if (!m) return;
    setMsg("");
    setMine((y) => [...y, `You: ${clip(m, 70)}`]);
    if (m === "exit") { setPhase("done"); return; }
    pieces(m).forEach((p, i) =>
      at(100 + i * 100, () => setTheirs((x) => [...x, `Peer: ${clip(p, 50)}${p.length > 50 ? ` (${p.length} chars)` : ""}`])),
    );
  };

  const door = log.some((l) => l.includes("forwarded"));
  const live = phase === "chat";
  const btn = "border px-3 py-1 text-sm transition-colors";
  const pre = "h-56 overflow-y-auto border-l-2 bg-black/60 px-4 py-3 text-xs leading-6 text-foreground/80 md:text-sm";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-16">
      <svg viewBox="0 0 400 70" className="w-full border border-white/15 bg-black/50" role="img" aria-label="Your computer, your router's door, the peer's router, the peer's computer">
        <line x1={70} x2={330} y1={35} y2={35} stroke={live ? C : "#333"} strokeWidth={2} strokeDasharray={live ? "0" : "4 4"} />
        {live && [0, 1, 2].map((i) => (
          <circle key={i} r={3} fill={C}>
            <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path="M70,35 L330,35" />
          </circle>
        ))}
        {[[20, "you"], [330, "peer"]].map(([x, l]) => (
          <g key={l as string}>
            <rect x={x as number} y={20} width={50} height={30} fill="none" stroke="#ededed" strokeOpacity={0.5} />
            <text x={(x as number) + 25} y={39} textAnchor="middle" fontSize={9} fill="#ededed">{l as string}</text>
          </g>
        ))}
        <rect x={70} y={26} width={8} height={18} fill={door ? G : R} />
        <rect x={322} y={26} width={8} height={18} fill={live ? G : "#333"} />
        <text x={74} y={62} textAnchor="middle" fontSize={8} fill="#707070">router door</text>
        <text x={326} y={62} textAnchor="middle" fontSize={8} fill="#707070">router door</text>
      </svg>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-32 shrink-0 text-dim">your router has UPnP</span>
            {[true, false].map((v) => (
              <button key={String(v)} onClick={() => { setUpnp(v); stop(); setPhase("idle"); }} aria-pressed={upnp === v} className={btn}
                style={{ borderColor: upnp === v ? C : "#333", color: upnp === v ? C : "#a1a1aa" }}>{v ? "yes" : "no"}</button>
            ))}
          </div>
          <label className="flex items-center gap-4">
            <span className="w-32 shrink-0 text-dim">peer is ready after</span>
            <input type="range" min={0} max={70} step={2} value={wait} onChange={(e) => { setWait(+e.target.value); stop(); setPhase("idle"); }} className="flex-1 accent-[#11a8cd]" />
            <span className="w-10 text-right">{wait}s</span>
          </label>
          <p className="text-xs text-dim">It tries 30 times, two seconds apart. Shown here at 8× speed.</p>
          <button onClick={run} disabled={phase === "run"} className={`${btn} w-fit disabled:opacity-40`} style={{ borderColor: C, color: C }}>
            {phase === "idle" ? "run p2pchat" : "run it again"}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <pre className={pre} style={{ borderColor: C }} aria-live="polite">
{["granted07@you:~$ p2pchat", ...log, ...mine].slice(-14).join("\n")}
          </pre>
          {live && (
            <>
              <div className="flex gap-2">
                <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} aria-label="Message"
                  placeholder="type a message. paste something very long. type exit." className="flex-1 border border-white/20 bg-black px-3 py-1 text-sm" />
                <button onClick={send} className={btn} style={{ borderColor: C, color: C }}>send</button>
              </div>
              <pre className={`${pre} h-32`} style={{ borderColor: G }}>
{["granted07@peer:~$ p2pchat  (what they see)", ...theirs].slice(-8).join("\n")}
              </pre>
            </>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs text-dim">Every line the program prints in that terminal is a real line from main.cpp.</p>
    </div>
  );
}