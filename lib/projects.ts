export type Project = {
  name: string;
  href: string;
  timeframe: string;
  role: string;
  problem: string;
  outcome: string;
  stack: string[];
  impact: string[];
};

export const projects: Project[] = [
  {
    name: "The Carcino Foundation",
    href: "https://thecarcinofoundation.org",
    timeframe: "2024",
    role: "Chief Technology Officer",
    problem: "Education platform for the common masses suffering from cancer, requires low friction access.",
    outcome: "Built a static-first system with instant rollouts and zero downtime publishing.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "MDX", "Vercel"],
    impact: [
    ],
  },
  {
    name: "GenUprising",
    href: "https://genuprising.com",
    timeframe: "2024",
    role: "Technical Lead",
    problem: "Advocacy hub had to post multiple articles in quick succession",
    outcome: "Worked with server caching and edge functions to deliver sub-200ms loads.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Cloudflare"],
    impact: [
    ],
  },
];
