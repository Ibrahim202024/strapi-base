import * as fs from 'fs';
import * as path from 'path';

import { rootDir } from './paths.mjs';

/**
 * The single frontend for this project.
 *
 * `strapiUrlKey` is the name of the environment variable the frontend reads
 * to locate the Strapi backend. Nuxt uses `STRAPI_URL` without a prefix
 * because it is a server-side value exposed via `runtimeConfig`.
 */
export interface Frontend {
  name: string;
  label: string;
  dir: string;
  port: number;
  strapiUrlKey: string;
}

const define = (
  name: string,
  label: string,
  port: number,
  strapiUrlKey: string
): Frontend => ({
  name,
  label,
  dir: path.join(rootDir, name),
  port,
  strapiUrlKey,
});

export const FRONTENDS: Frontend[] = [
  define('nuxt', 'Nuxt 4', 3001, 'STRAPI_URL'),
];

/**
 * Frontends actually checked out. The registry lists all four so the
 * scripts are complete from the first commit, but a framework that has
 * not landed yet must not break setup, dev, or the env check.
 */
export function presentFrontends(): Frontend[] {
  return FRONTENDS.filter((f) =>
    fs.existsSync(path.join(f.dir, 'package.json'))
  );
}

export function getFrontend(name: string): Frontend {
  const found = FRONTENDS.find((f) => f.name === name);
  if (!found) {
    const names = FRONTENDS.map((f) => f.name).join(', ');
    throw new Error(`Unknown frontend "${name}". Expected one of: ${names}`);
  }
  return found;
}

export const frontendUrl = (f: Frontend): string =>
  `http://localhost:${f.port}`;
