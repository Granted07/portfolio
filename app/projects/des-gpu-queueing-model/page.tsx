import type { Metadata } from "next";
import { DESStory } from "@/components/des/des-story";

export const metadata: Metadata = {
  title: "des-gpu-queue",
  description: "A discrete-event simulator of requests queueing for a GPU. Step through it, break it, sweep it.",
};

export default function DESPage() {
  return <DESStory />;
}