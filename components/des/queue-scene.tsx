"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { advance, type Sim } from "@/lib/des/sim";

// speed = simulated milliseconds per real second
export type Ctl = { sim: Sim; speed: number; run: boolean };
type P = { st: "in" | "q" | "s" | "out" | "blk" | "hit"; t0: number; x: number; y: number };

const MAXP = 256, ENTRY = -8.6, EXIT = 8.6, GX = 3.2;
const COLOR = { in: "#0dbc79", q: "#0dbc79", s: "#e5e510", out: "#ededed", blk: "#cd3131", hit: "#11a8cd" };
const qPos = (i: number) => [-7.3 + (i % 16) * 0.28, -1.1 + Math.floor(i / 16) * 0.28];
const gPos = (i: number) => [GX - 1 + (i % 8) * 0.28, -1 + Math.floor(i / 8) * 0.28];

// Every dot is one request, driven by the same event list the stepper shows.
function Scene({ ctl }: { ctl: Ctl }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const bar = useRef<THREE.Mesh>(null);
  const buf = useRef<THREE.Mesh>(null);
  const ps = useRef(new Map<number, P>());
  const last = useRef<Sim | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  useFrame((s, dt) => {
    const sim = ctl.sim, now = s.clock.elapsedTime, m = mesh.current;
    if (!m) return;
    if (last.current !== sim) { last.current = sim; ps.current.clear(); }
    if (ctl.run) advance(sim, Math.min(dt, 0.1) * ctl.speed);

    if (sim.trace) {
      for (const e of sim.trace) {
        if (e.k === "arrive" || e.k === "block" || e.k === "hit") {
          if (ps.current.size < MAXP) ps.current.set(e.id, { st: e.k === "arrive" ? "in" : e.k === "block" ? "blk" : "hit", t0: now, x: ENTRY, y: 0 });
        } else {
          const p = ps.current.get(e.id);
          if (p) { p.st = e.k === "start" ? "s" : "out"; p.t0 = now; }
        }
      }
      sim.trace.length = 0;
    }

    const qi = new Map(sim.queue.map((r, i) => [r.id, i])), si = new Map(sim.serving.map((r, i) => [r.id, i]));
    const k = 1 - Math.exp(-dt * 12);
    let n = 0;
    for (const [id, p] of ps.current) {
      const age = now - p.t0;
      let tx = p.x, ty = p.y, sc = 0.11;
      if (p.st === "in" || p.st === "q") { const i = qi.get(id); if (i !== undefined) [tx, ty] = qPos(i); p.st = "q"; }
      else if (p.st === "s") { const i = si.get(id); if (i !== undefined) { [tx, ty] = gPos(i); tx += Math.sin(now * 30 + id) * 0.02; } }
      else if (p.st === "out") { tx = EXIT; ty = 0; sc = 0.11 * Math.max(0, 1 - age / 1.2); if (age > 1.2) { ps.current.delete(id); continue; } }
      else if (p.st === "blk") { tx = ENTRY; ty = 0.4 + age * 2; sc = 0.11 + age * 0.2; if (age > 0.7) { ps.current.delete(id); continue; } }
      else { tx = EXIT; ty = 2.2; sc = 0.11 * Math.max(0, 1 - age / 1.5); if (age > 1.5) { ps.current.delete(id); continue; } }
      p.x += (tx - p.x) * k; p.y += (ty - p.y) * k;
      dummy.position.set(p.x, p.y, 0); dummy.scale.setScalar(sc); dummy.updateMatrix();
      m.setMatrixAt(n, dummy.matrix); m.setColorAt(n, col.set(COLOR[p.st])); n++;
    }
    m.count = n; m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    if (bar.current) {
      const f = sim.serving.length ? Math.min(1, (sim.t - sim.startT) / (sim.departAt - sim.startT)) : 0;
      bar.current.scale.x = Math.max(0.001, f * 2.8); bar.current.position.x = GX - 1.4 + (f * 2.8) / 2;
    }
    if (buf.current) {
      const h = Math.ceil(sim.cfg.N / 16) * 0.28 + 0.2;
      buf.current.scale.set(4.9, h, 0.4); buf.current.position.set(-5, -1.25 + h / 2, 0);
    }
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, MAXP]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} /><meshBasicMaterial />
      </instancedMesh>
      <mesh ref={buf}><boxGeometry /><meshBasicMaterial transparent opacity={0} /><Edges color="#555" /></mesh>
      <mesh position={[GX, 0, 0]}><boxGeometry args={[2.8, 2.8, 0.5]} /><meshBasicMaterial transparent opacity={0} /><Edges color="#e5e510" /></mesh>
      <mesh ref={bar} position={[GX, -1.65, 0]}><boxGeometry args={[1, 0.08, 0.1]} /><meshBasicMaterial color="#e5e510" /></mesh>
    </>
  );
}

export default function QueueScene({ ctl, orbit }: { ctl: Ctl; orbit?: boolean }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.8, 15], fov: 38 }} style={{ touchAction: "pan-y" }}>
      <Scene ctl={ctl} />
      {orbit && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  );
}