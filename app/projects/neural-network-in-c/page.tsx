import type { Metadata } from "next";
import { NNStory } from "@/components/nn/nn-story";

export const metadata: Metadata = {
  title: "neural-network-in-c",
  description: "A neural network library in C, from the matrix up. Train it on XOR and watch the weights change.",
};

export default function NeuralNetworkPage() {
  return <NNStory />;
}