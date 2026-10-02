"use client";
import { useEffect, useRef, useState } from "react";

const G = "!<>-_\\/[]{}=+*^?#01";

export function Scramble({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    let iv: ReturnType<typeof setInterval>;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let i = 0;
      setTimeout(() => {
        iv = setInterval(() => {
          i += 0.6;
          setOut(
            [...text].map((c, k) => (c === " " || k < i ? c : G[(Math.random() * G.length) | 0])).join(""),
          );
          if (i >= text.length) {
            clearInterval(iv);
            setOut(text);
          }
        }, 32);
      }, delay);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(iv);
    };
  }, [text, delay]);

  return <span ref={ref}>{out}</span>;
}
