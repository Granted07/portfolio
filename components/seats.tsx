"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const COLS = 48, ROWS = 28;
const level = (p: number) => (p < 0.8 ? 0.15 + 0.75 * (p / 0.8) : 0.9 - ((p - 0.8) / 0.2) * 0.55);

export function Seats() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 60);
    const place = () => cam.position.set(0, 0, innerWidth < 700 ? 13 : 9);
    place();

    const n = COLS * ROWS, pos = new Float32Array(n * 3), idx = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([((i % COLS) - COLS / 2) * 0.32, (((i / COLS) | 0) - ROWS / 2) * 0.32, 0], i * 3);
      idx[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aI", new THREE.BufferAttribute(idx, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uF: { value: 0.15 }, uT: { value: 0 }, uS: { value: renderer.getPixelRatio() * 26 } },
      vertexShader: `attribute float aI; uniform float uF,uT,uS; varying float vOn;
        void main(){ vec3 p=position; p.z+=.12*sin(uT*.8+p.x*1.3+p.y*1.7);
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
          gl_PointSize=uS*(6./-mv.z); vOn=step(aI,uF); }`,
      fragmentShader: `uniform float uF; varying float vOn;
        void main(){ vec3 c = uF<.6 ? vec3(.05,.74,.47) : (uF<.85 ? vec3(.9,.9,.06) : vec3(.8,.19,.19));
          gl_FragColor = vOn>.5 ? vec4(c,.9) : vec4(.4,.45,.4,.22); }`,
    });
    const pts = new THREE.Points(geo, mat);
    pts.rotation.x = -1.05;
    scene.add(pts);

    let target = 0.15, cur = 0.15;
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => (target = level(s.progress)) });
    const hud = document.getElementById("hud");
    const tick = (t: number) => {
      cur += (target - cur) * 0.06;
      mat.uniforms.uF.value = cur;
      mat.uniforms.uT.value = t;
      if (hud) {
        hud.textContent = `deck ${Math.round(cur * 100)}%`;
        hud.style.color = cur < 0.6 ? "#0dbc79" : cur < 0.85 ? "#e5e510" : "#cd3131";
      }
      renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    const resize = () => {
      renderer.setSize(innerWidth, innerHeight);
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      place();
    };
    addEventListener("resize", resize);
    return () => {
      removeEventListener("resize", resize);
      gsap.ticker.remove(tick);
      st.kill(); geo.dispose(); mat.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-40" />;
}