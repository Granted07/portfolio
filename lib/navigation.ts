import type { LucideIcon } from "lucide-react";
import { Home, Archive, Mail } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tone: string;
};

export const navigation: NavigationItem[] = [
  { href: "/", label: "Home", icon: Home, tone: "var(--term-blue)" },
  { href: "/projects", label: "Projects", icon: Archive, tone: "var(--term-magenta)" },
  { href: "/contact", label: "Contact", icon: Mail, tone: "var(--term-green)" },
];
