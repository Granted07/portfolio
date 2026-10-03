import type { Metadata } from "next";
import { ChessStory } from "@/components/chess/chess-story";

export const metadata: Metadata = {
  title: "chess-engine",
  description: "A chess engine in Python with no chess library. Play it, and watch what it skips.",
};

export default function ChessEnginePage() {
  return <ChessStory />;
}
