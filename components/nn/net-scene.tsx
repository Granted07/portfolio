"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { forward, type Layer } from "@/lib/nn/net";

export type Holder = { net: Layer[] };
type Props = { H: Holder; sizes: number[]; probe?: { current: number[] }; orbit?: boolean };

const GREEN = new THREE.Color("#0dbc79"), RED = new THREE.Color("#cd3131"), DIM = new THREE.Color("#2a2a2a");
const cl = (v: number) => Math.min(1, Math.max(0, v));

// Every line is a real weight: green positive, red negative, brighter when larger.
// Every dot of light is a real signal: input x weight, travelling the edge it belongs to.
function Scene({ H, sizes, probe }: Props) {
  const group = useRef<THREE.Group>(null);
  const dots = useRef<(THREE.Mesh | null)[]>([]);
  const m = useMemo(() => {
    const pos = sizes.map((n, i) => Array.from({ length: n }, (_, j) => new THREE.Vector3((i - (sizes.length - 1) / 2) * 3, (j - (n - 1) / 2) * 1.1, 0)));
    const edges: { a: THREE.Vector3; b: THREE.Vector3; l: number; i: number; j: number }[] = [];
    for (let l = 0; l < sizes.length - 1; l++) pos[l].forEach((a, i) => pos[l + 1].forEach((b, j) => edges.push({ a, b, l, i, j })));
    const lp = new Float32Array(edges.length * 6);
    edges.forEach((e, k) => lp.set([e.a.x, e.a.y, e.a.z, e.b.x, e.b.y, e.b.z], k * 6));
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    lines.setAttribute("color", new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    const pts = new THREE.BufferGeometry();
    pts.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edges.length * 3), 3));
    pts.setAttribute("color", new THREE.BufferAttribute(new Float32Array(edges.length * 3), 3));
    return { pos, edges, lines, pts };
  }, [sizes]);

  useFrame((s) => {
    const t = s.clock.elapsedTime, net = H.net;
    const inp = probe?.current ?? [0.5 + 0.5 * Math.sin(t * 0.8), 0.5 + 0.5 * Math.cos(t * 0.55)];
    forward(net, inp);
    const act = (l: number, i: number) => (l === 0 ? inp[i] ?? 0 : net[l - 1]?.a[i] ?? 0);

    m.pos.forEach((layer, l) => layer.forEach((_, i) => {
      const mesh = dots.current[l * 16 + i];
      if (!mesh) return;
      const a = cl(Math.abs(act(l, i)));
      mesh.scale.setScalar(0.14 + 0.12 * a);
      (mesh.material as THREE.MeshBasicMaterial).color.copy(DIM).lerp(GREEN, a);
    }));

    const lc = m.lines.attributes.color as THREE.BufferAttribute;
    const pc = m.pts.attributes.color as THREE.BufferAttribute;
    const pp = m.pts.attributes.position as THREE.BufferAttribute;
    m.edges.forEach((e, k) => {
      const w = net[e.l]?.W[e.j]?.[e.i] ?? 0, tint = w >= 0 ? GREEN : RED, k1 = 0.15 + 0.85 * cl(Math.abs(w) / 2);
      lc.setXYZ(k * 2, tint.r * k1, tint.g * k1, tint.b * k1);
      lc.setXYZ(k * 2 + 1, tint.r * k1, tint.g * k1, tint.b * k1);
      const p = (t * 0.4 + k * 0.173) % 1, sg = cl(Math.abs(act(e.l, e.i) * w) / 1.2);
      pp.setXYZ(k, e.a.x + (e.b.x - e.a.x) * p, e.a.y + (e.b.y - e.a.y) * p, 0);
      pc.setXYZ(k, tint.r * sg, tint.g * sg, tint.b * sg);
    });
    lc.needsUpdate = true; pc.needsUpdate = true; pp.needsUpdate = true;
    if (group.current) group.current.rotation.y = Math.sin(t * 0.25) * 0.45;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={m.lines}><lineBasicMaterial vertexColors transparent opacity={0.9} /></lineSegments>
      <points geometry={m.pts}><pointsMaterial vertexColors size={0.14} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      {m.pos.flatMap((layer, l) => layer.map((p, i) => (
        <mesh key={`${l}-${i}`} position={p} ref={(el) => { dots.current[l * 16 + i] = el; }}>
          <sphereGeometry args={[1, 18, 18]} />
          <meshBasicMaterial color="#2a2a2a" />
        </mesh>
      )))}
    </group>
  );
}

export default function NetScene(props: Props) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 11], fov: 40 }} style={{ touchAction: "pan-y" }}>
      <Scene {...props} />
      {props.orbit && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  );
}