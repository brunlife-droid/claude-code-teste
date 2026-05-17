import { AsyncLocalStorage } from "node:async_hooks";

interface RlsContext {
  tenantId: string | null;
}

const rlsContext = new AsyncLocalStorage<RlsContext>();

export function getRlsTenantId(): string | null {
  return rlsContext.getStore()?.tenantId ?? null;
}

export function setRlsTenantId(tenantId: string | null): void {
  rlsContext.enterWith({ tenantId });
}

export async function withRlsTenant<T>(
  tenantId: string | null | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  return rlsContext.run({ tenantId: tenantId ?? null }, fn);
}
