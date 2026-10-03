import type { Metadata } from "next";
import { MCStory } from "@/components/mc/mc-story";

export const metadata: Metadata = {
  title: "mc-console",
  description: "A web console for a Minecraft server. Try to get a command past the six checks.",
};

export default function MCConsolePage() {
  return <MCStory />;
}