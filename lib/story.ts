export type Chapter = { name: string; path: string; ext: string; href: string; color: string; lines: string[]; code: string };

const C = { r: "#cd3131", g: "#0dbc79", y: "#e5e510", b: "#2472c8", m: "#bc3fbc", c: "#11a8cd" };

export const research = {
  href: "https://github.com/Granted07/DES_GPUQueueingModel",
  lines: [
    "Research on reducing latency when neural networks are served on GPUs.",
    "Requests are modelled as a queue with batching, a finite buffer and cache hits.",
    "Service times are measured on a real GPU and fed back into the simulator.",
  ],
  code: `M / G(a,b) / 1 / N
  arrivals   exp(λ)
  service    gamma(μ(b), cov 0 · .5 · 1.4)
  batch b    1 2 4 8 16 32 64   # googlenet, onnx runtime cuda
  out        latency · blocking · little's law`,
};

export const chapters: Chapter[] = [
  {
    name: "gpu-queue", path: "~/DES_GPUQueueingModel", ext: "c", color: C.g,
    href: "https://github.com/Granted07/DES_GPUQueueingModel",
    lines: ["A discrete event simulator for scheduling task arrivals at an approximated rate.", "Research work on neural network service latency optimisation."],
    code: "static Event heap[MAX_EVENTS]; // fixed storage\nsim_run(&cfg, seed); // → csv",
  },
  {
    name: "nn-in-c", path: "~/NeuralNetworkInC", ext: "c", color: C.y,
    href: "https://github.com/Granted07/NeuralNetworkInC",
    lines: ["A neural network library written in C.", "Matrices, layers and backpropagation, built from scratch."],
    code: "z = W x + b\na = act(z)\nW -= lr * dL/dz * xᵀ",
  },
  {
    name: "p2pchat", path: "~/p2pchat", ext: "cpp", color: C.c,
    href: "https://github.com/Granted07/p2pchat",
    lines: ["A chat app where two computers talk directly, with no server in between.", "Uses UPnP to open the port on the router."],
    code: "upnp_map(port, \"TCP\");\nconnect(peer);",
  },
  {
    name: "chess-engine", path: "~/chess-engine", ext: "py", color: C.m,
    href: "https://github.com/Granted07/Chess-Engine-Python",
    lines: ["A chess engine in Python, written without any chess library.", "Handles castling and en passant."],
    code: "moves = legal(board)\nboard.push(best(moves))",
  },
  {
    name: "mc-console", path: "~/mc-console", ext: "ts", color: C.b,
    href: "https://github.com/Granted07/mc-console",
    lines: ["A web console for a Minecraft server.", "Streams the server log live and sends commands to it through tmux."],
    code: "tail(log) → ws → ansi\ncmd → auth → tmux send-keys",
  },
  {
    name: "jimnios", path: "~/jimnios", ext: "arch", color: C.r,
    href: "https://github.com/JimniOS",
    lines: ["A Linux distribution for students, based on Arch.", "I was the designer."],
    code: "pacman -S student",
  },
  {
    name: "genuprising", path: "~/genuprising", ext: "ts", color: C.g,
    href: "https://genuprising.com",
    lines: ["Website for an advocacy group that publishes many articles in quick succession.", "Caching and edge functions keep it loading in under 200ms."],
    code: "cache → edge → 200ms",
  },
  {
    name: "repak-rebnk", path: "~/repak-rebnk", ext: "rs", color: C.y,
    href: "https://github.com/Granted07/repak-rebnk",
    lines: ["A fork of a Rust tool for Unreal Engine pak files.", "Opens and inspects game archives."],
    code: "pak.unpack(&mut out)?;",
  },
];

export const repos = [
  { name: "DES_GPUQueueingModel", tag: "research", color: C.g, note: "GPU inference queue simulator", href: "https://github.com/Granted07/DES_GPUQueueingModel" },
  { name: "NeuralNetworkInC", tag: "library", color: C.y, note: "neural network library in C", href: "https://github.com/Granted07/NeuralNetworkInC" },
  { name: "p2pchat", tag: "network", color: C.c, note: "peer-to-peer chat", href: "https://github.com/Granted07/p2pchat" },
  { name: "mc-console", tag: "tool", color: C.b, note: "web console for a minecraft vps", href: "https://github.com/Granted07/mc-console" },
  { name: "genu-website", tag: "web", color: C.m, note: "the genuprising site", href: "https://github.com/Granted07/genu-website" },
  { name: "anicli", tag: "cli", color: C.r, note: "anime, from the terminal", href: "https://github.com/Granted07/anicli" },
  { name: "K-Folio", tag: "fork", color: C.m, note: "project-wing 2026, web domain", href: "https://github.com/Granted07/K-Folio" },
  { name: "dots", tag: "config", color: C.c, note: "where this terminal came from", href: "https://github.com/Granted07/dots" },
];