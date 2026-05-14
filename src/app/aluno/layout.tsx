import type { Metadata } from "next";
import { AlunoSidebar } from "@/components/shell";
import { getCurrentTenant } from "@/lib/tenants/server";

export const metadata: Metadata = {
  title: "Aluno · Nexus Education",
  robots: { index: false, follow: false },
};

const STUDENT_NAME = "João Pedro Silva";

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getCurrentTenant();
  return (
    <div className="bg-canvas grid h-screen grid-cols-[280px_1fr] overflow-hidden">
      <AlunoSidebar tenant={tenant} studentName={STUDENT_NAME} />
      <main className="flex min-h-0 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
