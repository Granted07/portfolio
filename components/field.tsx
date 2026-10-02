"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const N = 7000;
const r = (s = 1) => (Math.random() - 0.5) * 2 * s;
const attr = (f: (i: number) => [number, number, number]) => {
  const a = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) a.set(f(i), i * 3);
  return new THREE.BufferAttribute(a, 3);
};

// five formations, one per stretch of the page: fog, board, two peers, rain, a single line
function formations() {
  return {
    position: attr(() => {
      const v = new THREE.Vector3(r(), r(), r()).normalize().multiplyScalar(2 + Math.random() * 4);
      return [v.x, v.y, v.z];
    }),
    b: attr((i) => {
      const x = ((i % 100) / 100) * 8 - 4;
      const y = (Math.floor(i / 100) / 70) * 8 - 4;
      return [x, y, ((Math.floor(x + 4) + Math.floor(y + 4)) % 2) * 0.5];
    }),
    c: attr((i) => {
      if (i % 4 === 0) {
        const t = Math.random();
        return [-3.5 + t * 7, Math.sin(t * Math.PI) * 1.4 + r(0.05), r(0.05)];
      }
      const v = new THREE.Vector3(r(), r(), r()).normalize().multiplyScalar(1.3);
      return [v.x + (i % 2 ? 3.5 : -3.5), v.y, v.z];
    }),
    d: attr(() => [Math.round(r(5.5) * 4) / 4, r(5), r(2)]),
    e: attr((i) => [(i / N) * 10 - 5, r(0.02), 0]),
  };
}

export function Field() {
  const host = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const onHome = useRef(true);
  onHome.current = pathname === "/";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 50);
    cam.position.z = 9;

    const geo = new THREE.BufferGeometry();
    Object.entries(formations()).forEach(([k, v]) => geo.setAttribute(k, v));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uP: { value: 0 }, uT: { value: 0 }, uS: { value: renderer.getPixelRatio() * 1.5 } },
      vertexShader: `
        attribute vec3 b; attribute vec3 c; attribute vec3 d; attribute vec3 e;
        uniform float uP, uT, uS; varying float vA;
        void main(){
          float s = clamp(uP, 0., .9999) * 4.; float f = fract(s); float k = smoothstep(0., 1., f);
          vec3 p;
          if (s < 1.) p = mix(position, b, k);
          else if (s < 2.) p = mix(b, c, k);
          else if (s < 3.) p = mix(c, d, k);
          else p = mix(d, e, k);
          float t = sin(f * 3.14159);
          p += normalize(position + .001) * t * 1.4;
          p += .04 * sin(uT * .6 + position * 5.);
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uS * (1.2 + t * 1.5) * (8. / -mv.z);
          vA = .35 + .65 * t;
        }`,
      fragmentShader: `
        varying float vA;
        void main(){ float r = length(gl_PointCoord - .5); if (r > .5) discard;
          gl_FragColor = vec4(vec3(1.), vA * .55 * (1. - r * 1.6)); }`,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let target = 0, cur = 0, visible = false;
    el.style.opacity = "0";
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => (target = s.progress) });

    const tick = (t: number) => {
      // visible only on the landing page, and only once the research section
      // has completely scrolled out of the viewport (its bottom edge is above the top)
      const research = document.getElementById("research");
      const want = onHome.current && !!research && research.getBoundingClientRect().bottom <= 0;
      if (want !== visible) {
        visible = want;
        el.style.opacity = want ? "0.25" : "0";
      }
      if (!visible) return; // no rendering at all while hidden

      cur += (target - cur) * 0.06;
      mat.uniforms.uP.value = cur;
      mat.uniforms.uT.value = t;
      pts.rotation.y = cur * Math.PI * 1.4;
      pts.rotation.x = Math.sin(cur * Math.PI) * 0.5;
      renderer.render(scene, cam);
    };


    gsap.ticker.add(tick);
    const resize = () => {
      renderer.setSize(innerWidth, innerHeight);
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
    };
    addEventListener("resize", resize);

    return () => {
      removeEventListener("resize", resize);
      gsap.ticker.remove(tick);
      st.kill();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
    />
  );
}