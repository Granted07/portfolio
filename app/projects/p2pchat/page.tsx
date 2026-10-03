import type { Metadata } from "next";
import { P2PStory } from "@/components/p2p/p2p-story";

export const metadata: Metadata = {
  title: "p2pchat",
  description: "A chat between two computers with no server in between. Take UPnP away, make the peer late, and see what happens.",
};

export default function P2PChatPage() {
  return <P2PStory />;
}