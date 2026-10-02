import type { Metadata } from "next";
import { Flow } from "@/components/flow";

export const metadata: Metadata = {
  title: "Research",
  description: "How a GPU can decide, live, how long to wait before it sets off.",
};

export default function ResearchPage() {
  return <Flow />;
}