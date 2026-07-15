"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Music2, User } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Songs", icon: Music2 },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-raised shadow-[0_1px_0_rgba(245,240,232,0.06)_inset,0_-4px_20px_rgba(0,0,0,0.35)]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto flex max-w-3xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition ${
                isActive ? "text-accent" : "text-text-muted hover:text-text"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.25 : 2}
                className="transition"
              />
              <span className={isActive ? "font-medium" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
