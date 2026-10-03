"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import type * as THREE from "three";
import { PST } from "@/lib/chess/tables";

// one column per square; height is the engine's own number for that piece standing there
function Col({ r, c, v }: { r: number; c: number; v: number }) {
  const m = useRef<THREE.Mesh>(null);
  const cur = useRef(0);
  useFrame(() => {
    cur.current += (v / 16 - cur.current) * 0.07;
    m.current!.scale.y = Math.max(Math.abs(cur.current), 0.03);
    m.current!.position.y = cur.current / 2;
  });
  const col = v > 0 ? "#f2f2f2" : v < 0 ? "#cd3131" : "#555";
  return (
    <mesh ref={m} position={[c - 3.5, 0, r - 3.5]}>
      <boxGeometry args={[0.82, 1, 0.82]} />
      <meshBasicMaterial color={col} transparent opacity={0.14} />
      <Edges color={col} />
    </mesh>
  );
}

function Board({ piece }: { piece: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => { g.current!.rotation.y = window.scrollY * 0.0009 + s.pointer.x * 0.5 + s.clock.elapsedTime * 0.05; });
  return <group ref={g}>{PST[piece].flatMap((row, r) => row.map((v, c) => <Col key={r * 8 + c} r={r} c={c} v={v} />))}</group>;
}

export default function Landscape({ piece }: { piece: string }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 7.5, 11], fov: 34 }} style={{ touchAction: "pan-y" }}>
      <Board piece={piece} />
    </Canvas>
  );
}
