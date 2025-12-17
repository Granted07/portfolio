import { ContactPanel } from "@/components/contact-panel";
import { profile } from "@/lib/profile";

const contactLinks = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "GitHub", value: "granted07", href: profile.github },
  { label: "LinkedIn", value: "anjishnu-dey", href: profile.linkedin },
];

export default function ContactPage() {
  return (
    <div className="pt-28">
      <ContactPanel contacts={contactLinks} />
    </div>
  );
}
