export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isDemoMode(): boolean {
  return (
    process.env.NEXUS_DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_NEXUS_DEMO_MODE === "true"
  );
}

export function allowsMockFallbacks(): boolean {
  if (process.env.NEXUS_ALLOW_MOCKS === "true") return true;
  if (isDemoMode()) return true;
  return !isProductionRuntime();
}

export function assertMockFallbackAllowed(kind: string, detail: string): void {
  if (allowsMockFallbacks()) return;
  throw new Error(
    `${kind} indisponivel em producao: ${detail}. Configure o provider real ou habilite NEXUS_DEMO_MODE explicitamente.`,
  );
}

export function shouldShowDemoCredentials(): boolean {
  return allowsMockFallbacks();
}
