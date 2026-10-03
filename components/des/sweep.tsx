"use client";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { fast, makeSim, metrics } from "@/lib/des/sim";
import type { Ctl } from "./queue-scene";

const BS = [1, 2, 4, 8, 16, 32, 64], PS = [0, 0.25, 0.5, 0.75], SEEDS = [1, 2, 3];
type Cell = { b: number; p: number; lat: number; blk: number };
const GREEN = new THREE.Color("#0dbc79"), RED = new THREE.Color("#cd3131");

// one bar per (batch limit, cache hit chance) pair: height is latency, redness is how many were turned away
function Bars({ cells, max, pick, sel }: { cells: Cell[]; max: number; pick: (i: number) => void; sel: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const cur = useRef<number[]>([]);
  useFrame(() => {
    cells.forEach((c, i) => {
      const m = refs.current[i]; if (!m) return;
      const target = Math.max(0.03, Math.min(1, c.lat / max) * 4);
      cur.current[i] = (cur.current[i] ?? 0.03) + (target - (cur.current[i] ?? 0.03)) * 0.1;
      m.scale.y = cur.current[i]; m.position.y = cur.current[i] / 2;
      (m.material as THREE.MeshBasicMaterial).color.copy(GREEN).lerp(RED, Math.min(1, c.blk * 2));
    });
  });
  return (
    <group rotation={[0, -0.5, 0]} position={[0, -1.5, 0]}>
      {cells.map((c, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[(BS.indexOf(c.b) - 3) * 0.9, 0, (PS.indexOf(c.p) - 1.5) * 0.9]} onClick={(e) => { e.stopPropagation(); pick(i); }}>
          <boxGeometry args={[0.65, 1, 0.65]} />
          <meshBasicMaterial transparent opacity={0.35} />
          <Edges color={i === sel ? "#ffffff" : "#888"} />
        </mesh>
      ))}
    </group>
  );
}

export function Sweep({ ctl }: { ctl: Ctl }) {
  const [cells, setCells] = useState<Cell[]>([]);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(-1);

  const run = () => {
    setBusy(true);
    const cfg = ctl.sim.cfg; // whatever the lab is set to right now
    requestAnimationFrame(() => setTimeout(() => {
      const out: Cell[] = [];
      for (const p of PS) for (const b of BS) {
        let lat = 0, blk = 0;
        for (const seed of SEEDS) {
          const s = makeSim({ ...cfg, b, a: Math.min(cfg.a, b), pHit: p }, seed);
          fast(s, 3000);
          const m = metrics(s); lat += m.overall / SEEDS.length; blk += m.block / SEEDS.length;
        }
        out.push({ b, p, lat, blk });
      }
      setCells(out); setSel(-1); setBusy(false);
    }, 20));
  };
  const max = Math.max(1e-6, ...cells.map((c) => c.lat)), c = cells[sel];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.3fr_1fr] md:px-16">
      <div className="aspect-[4/3] w-full border border-white/15 bg-black/50">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 4, 9], fov: 40 }} style={{ touchAction: "pan-y" }}>
          <Bars cells={cells} max={max} pick={setSel} sel={sel} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
      <div className="flex flex-col gap-5 text-sm">
        <button onClick={run} disabled={busy} className="w-fit border px-3 py-1 disabled:opacity-40" style={{ borderColor: "#e5e510", color: "#e5e510" }}>{busy ? "simulating…" : cells.length ? "run it again" : "run the sweep"}</button>
        <p className="text-dim">28 settings × 3 seeds × 3,000 requests, using the sliders from the lab above (except batch limit and cache chance, which this sweeps). Along one edge the batch limit goes 1 → 64. Along the other the cache hit chance goes 0 → 0.75. Height is mean latency. Green to red is the share of requests turned away. Click a bar.</p>
        {c && (
          <pre className="border-l-2 bg-black/60 px-4 py-3 leading-6 text-foreground/80" style={{ borderColor: "#e5e510" }}>
{`batch limit   ${c.b}
cache chance  ${c.p}
latency       ${c.lat.toFixed(2)} ms
turned away   ${(c.blk * 100).toFixed(1)} %`}
          </pre>
        )}
      </div>
    </div>
  );
}