import type { LucideIcon } from "lucide-react";
import { Home, Archive, Mail } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navigation: NavigationItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: Archive },
  { href: "/contact", label: "Contact", icon: Mail },
];
