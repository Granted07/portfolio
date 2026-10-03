// The same arithmetic as NeuralNetworkInC, ported so it can run in the browser.
// Conventions match the C library: column vectors, W is (out x in), the derivative receives z,
// loss is mean squared error, and every layer caches x, z and a for the backward pass.

export type Act = "sigmoid" | "relu";
export type Layer = { W: number[][]; b: number[]; x: number[]; z: number[]; a: number[]; act: Act };

const sig = (z: number) => 1 / (1 + Math.exp(-z));
export const ACT: Record<Act, { f: (z: number) => number; d: (z: number) => number }> = {
  sigmoid: { f: sig, d: (z) => sig(z) * (1 - sig(z)) },
  relu: { f: (z) => (z > 0 ? z : 0), d: (z) => (z > 0 ? 1 : 0) },
};

export const XOR: [number[], number[]][] = [[[0, 0], [0]], [[0, 1], [1]], [[1, 0], [1]], [[1, 1], [0]]];

const uniform = () => Math.random() * 2 - 1; // the library starts every weight and bias in [-1, 1]

export function create(sizes: number[], acts: Act[]): Layer[] {
  return acts.map((act, i) => ({
    W: Array.from({ length: sizes[i + 1] }, () => Array.from({ length: sizes[i] }, uniform)),
    b: Array.from({ length: sizes[i + 1] }, uniform),
    x: [], z: [], a: [], act,
  }));
}

export function forward(net: Layer[], input: number[]): number[] {
  let v = input;
  for (const L of net) {
    L.x = v;
    L.z = L.W.map((row, i) => row.reduce((s, w, j) => s + w * v[j], L.b[i])); // z = W x + b
    L.a = L.z.map(ACT[L.act].f); // a = activation(z)
    v = L.a;
  }
  return v;
}

export const mse = (p: number[], t: number[]) => p.reduce((s, y, i) => s + (y - t[i]) ** 2, 0) / p.length;

// call after forward(): it reads what forward cached
export function backward(net: Layer[], target: number[], lr: number) {
  const out = net[net.length - 1].a;
  let da = out.map((y, i) => (2 / out.length) * (y - target[i])); // dMSE/da
  for (let k = net.length - 1; k >= 0; k--) {
    const L = net[k];
    const dz = da.map((g, i) => g * ACT[L.act].d(L.z[i])); // dL/dz = dL/da * activation'(z)
    const dx = L.x.map((_, j) => L.W.reduce((s, row, i) => s + row[j] * dz[i], 0)); // dL/dx = Wᵀ dL/dz (old W)
    L.W.forEach((row, i) => row.forEach((_, j) => (row[j] -= lr * dz[i] * L.x[j]))); // dL/dW = dz xᵀ
    L.b.forEach((_, i) => (L.b[i] -= lr * dz[i])); // dL/db = dz
    da = dx;
  }
}