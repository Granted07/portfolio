export type Chapter = { name: string; path: string; ext: string; href: string; color: string; lines: string[]; code: string };

const C = { r: "#cd3131", g: "#0dbc79", y: "#e5e510", b: "#2472c8", m: "#bc3fbc", c: "#11a8cd" };

export const research = {
  href: "/projects/des-gpu-queueing-model",
  teaser: "A GPU answers in groups. How long should it wait for a fuller ferry?",
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
    href: "/projects/des-gpu-queueing-model",
    lines: ["A simulator of requests queuing on a GPU that runs a neural network.", "Batch times come from real GoogLeNet runs, then get replayed under different loads."],
    code: "mean = slope * b + intercept;\ndeparture = start + gamma(mean, cov);",
  },
  {
    name: "chess-engine", path: "~/chess-engine", ext: "py", color: C.r,
    href: "/projects/chess-engine",
    lines: ["A chess engine in Python, written without a chess library.", "Handles castling and en passant."],
    code: "moves = legal(board)\nboard.push(best(moves))",
  },
  {
    name: "nn-in-c", path: "~/NeuralNetworkInC", ext: "c", color: C.y,
    href: "/projects/neural-network-in-c",
    lines: ["A small neural network library in C.", "Matrices, layers and training are written by hand, with no outside libraries."],
    code: "z = W x + b\na = act(z)\nW -= lr * dL/dz * xᵀ",
  },
  {
    name: "p2pchat", path: "~/p2pchat", ext: "cpp", color: C.c,
    href: "/projects/p2pchat",
    lines: ["Connects two computers directly, with no server in between.", "It asks the router to open a port using UPnP."],
    code: "upnp_map(port, \"TCP\");\nconnect(peer);",
  },
  {
    name: "mc-console", path: "~/mc-console", ext: "ts", color: C.b,
    href: "/projects/mc-console",
    lines: ["A web page that shows a Minecraft server's log live and lets you send it commands.", "Each command passes a login token, a rate limit and input cleaning before it reaches the server."],
    code: "log → websocket → browser\ncommand → checks → tmux send-keys",
  },
  {
    name: "genuprising", path: "~/genu-website", ext: "ts", color: C.m,
    href: "https://genuprising.com",
    lines: ["The website for GenUprising, an advocacy group.", "Built with Next.js and a Supabase database. Caching keeps pages under 200ms."],
    code: "cache → edge → 200ms",
  },
  {
    name: "repak-rebnk", path: "~/repak-rebnk", ext: "rs", color: C.y,
    href: "https://github.com/Granted07/repak-rebnk",
    lines: ["A fork of repak-rivals, a Rust library and command line tool.", "It reads and writes the .pak archives that Unreal Engine games use."],
    code: "pak.unpack(&mut out)?;",
  },
];

export const repos = [
  { name: "DES_GPUQueueingModel", tag: "research", color: C.g, note: "GPU inference queue simulator", href: "https://github.com/Granted07/DES_GPUQueueingModel" },
  { name: "NeuralNetworkInC", tag: "library", color: C.y, note: "neural network library in C", href: "https://github.com/Granted07/NeuralNetworkInC" },
  { name: "p2pchat", tag: "network", color: C.c, note: "peer to peer chat over UPnP", href: "https://github.com/Granted07/p2pchat" },
  { name: "mc-console", tag: "tool", color: C.b, note: "web console for a Minecraft server", href: "https://github.com/Granted07/mc-console" },
  { name: "genu-website", tag: "web", color: C.m, note: "GenUprising site, Next.js and Supabase", href: "https://github.com/Granted07/genu-website" },
  { name: "repak-rebnk", tag: "fork", color: C.y, note: "Unreal Engine .pak library in Rust", href: "https://github.com/Granted07/repak-rebnk" },
  { name: "anicli", tag: "cli", color: C.r, note: "anime from the terminal", href: "https://github.com/Granted07/anicli" },
];