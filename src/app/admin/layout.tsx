import type { Metadata } from "next";
import { Sidebar, Topbar } from "@/components/shell";

export const metadata: Metadata = {
  title: "Admin · Nexus Education",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas grid h-screen grid-cols-[260px_1fr] overflow-hidden">
      <Sidebar layer="admin" />
      <main className="scroll-thin flex min-h-0 flex-col overflow-auto">
        <Topbar layer="admin" />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
