/**
 * Cliente Drizzle para Neon Postgres (serverless).
 *
 * Em runtime sem DATABASE_URL configurada, exporta um proxy que
 * lança erro descritivo na primeira query — isso permite que o app
 * faça build e renderize páginas estáticas/mockadas durante a Fase 0.
 *
 * Quando o usuário fornecer a connection string Neon (variável de
 * ambiente DATABASE_URL), as queries reais passam a funcionar sem
 * mudança de código.
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

let cached: DbClient | null = null;

function build(): DbClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return new Proxy({} as DbClient, {
      get() {
        throw new Error(
          "DATABASE_URL não configurada. Defina a connection string do Neon " +
            "para usar queries reais. Veja docs/SETUP.md.",
        );
      },
    });
  }
  const pool = new Pool({ connectionString: url });
  return drizzle(pool, { schema });
}

export function db(): DbClient {
  if (!cached) cached = build();
  return cached;
}

export { schema };
