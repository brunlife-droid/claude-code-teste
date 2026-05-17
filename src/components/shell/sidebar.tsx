"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui";
import { PrefLogo } from "@/components/tenant";
import type { Tenant } from "@/lib/tenants";
import { cn } from "@/lib/cn";
import { NexusMark } from "./nexus-mark";
import { LogoutButton } from "./logout-button";
import { LAYERS, type LayerConfig, type LayerKey } from "./nav";

interface SidebarProps {
  layer: LayerKey;
  tenant: Tenant;
  userName?: string;
  userRole?: string;
}

export function Sidebar({ layer, tenant, userName, userRole }: SidebarProps) {
  const config = LAYERS[layer];
  const pathname = usePathname();
  const isAdmin = layer === "admin";
  const user = {
    name: userName ?? config.user?.name ?? "Usuário",
    role: userRole ?? config.user?.role ?? config.label,
  };

  return (
    <aside className="bg-surface-raised border-border flex h-full flex-col overflow-hidden border-r shadow-[var(--shadow-sm)]">
      {/* Header */}
      <div className="border-border/80 bg-surface-tint flex items-center gap-2.5 border-b px-3.5 py-3.5">
        {isAdmin ? (
          <>
            <NexusMark size={28} />
            <div className="leading-tight">
              <div className="text-[13px] font-semibold">Nexus Admin</div>
              <div className="text-text-faint text-[10.5px]">
                Console interno
              </div>
            </div>
          </>
        ) : (
          <PrefLogo tenant={tenant} />
        )}
      </div>

      {/* Scrollable nav */}
      <div className="scroll-thin flex-1 overflow-y-auto px-2 py-2 pb-4">
        {/* Layer switcher */}
        <div className="px-3 pt-2.5 pb-1">
          <div className="section-label">
            Camada
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(Object.values(LAYERS) as LayerConfig[]).map((l) => {
              const active = l.key === layer;
              const target = l.groups[0]?.items[0]?.href ?? "/";
              return (
                <Link
                  key={l.key}
                  href={target}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11.5px] transition-colors",
                    active
                      ? "bg-primary border-primary text-primary-fg shadow-[var(--shadow-xs)]"
                      : "bg-surface-raised border-border text-text-muted hover:bg-primary-soft hover:text-primary hover:border-primary-border",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User card */}
        <div className="soft-band mx-3 mt-3 flex items-center gap-2.5 rounded-lg p-2.5">
          <Avatar name={user.name} size={32} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12.5px] font-medium">
              {user.name}
            </div>
            <div className="text-text-subtle truncate text-[10.5px]">
              {user.role}
            </div>
          </div>
        </div>

        {/* Nav groups */}
        {config.groups.map((group) => (
          <div key={group.title} className="px-3 pt-3 pb-1">
            <div className="section-label px-2.5 pt-2 pb-1">
              {group.title}
            </div>
            <ul>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 text-[13px] transition-colors",
                        active
                          ? "border-primary-border bg-primary-soft text-primary font-semibold shadow-[var(--shadow-xs)]"
                          : "border-transparent text-text-muted hover:bg-surface-tint hover:text-text hover:border-primary-border",
                      )}
                    >
                      <span
                        className={cn(
                          "min-w-[28px] font-mono text-[10.5px]",
                          active ? "text-primary" : "text-text-faint",
                        )}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.id}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-border space-y-2 border-t px-3 py-3">
        <LogoutButton />
        <div className="text-text-faint flex justify-between text-[10.5px]">
          <span>Powered by</span>
          <span className="text-text-muted font-semibold">
            nexus<span className="text-primary">.</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
