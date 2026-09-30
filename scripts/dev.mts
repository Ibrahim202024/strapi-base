import { spawn } from 'child_process';
import * as path from 'path';

import {
  checkEnv,
  readEnvValue,
  reportCheck,
  setPreviewTarget,
} from './env.mjs';
import { getFrontend } from './frontends.mjs';
import { backendDir, rootDir } from './paths.mjs';
import { run } from './run.mjs';

/**
 * Starts Strapi, waits for its health check, then starts Nuxt.
 * Both processes share the parent stdio so output reaches the terminal.
 * Stopping either kills the other.
 *
 * Uses `yarn develop` / `yarn dev` with an explicit `cwd` instead of
 * `cd <dir> && yarn …` shell chaining. On Windows, `&&` inside a spawn
 * shell command string is interpreted by the outer cmd.exe before the
 * child process sees it, which causes the command to silently misbehave.
 */

const frontend = getFrontend('nuxt');

const result = checkEnv();
if (!result.ok) {
  reportCheck(result);
  throw new Error('Refusing to start with an inconsistent environment.');
}

const url = setPreviewTarget(frontend.name);
const strapiPort = readEnvValue(`${backendDir}/.env`, 'PORT') ?? '1337';
const strapiDir = path.join(rootDir, 'strapi');
const frontendDir = path.join(rootDir, frontend.name);

console.log(
  `\nStarting Strapi on :${strapiPort} and ${frontend.label} on :${frontend.port}`
);
console.log(`Preview target: ${url}\n`);

const isWin = process.platform === 'win32';

function spawnInherit(
  cmd: string,
  args: string[],
  cwd: string
): ReturnType<typeof spawn> {
  return spawn(cmd, args, { cwd, stdio: 'inherit', shell: isWin });
}

// --- Start Strapi ---
const strapiProc = spawnInherit('yarn', ['develop'], strapiDir);

strapiProc.on('close', (code) => {
  console.error(`\n[strapi] exited with code ${code ?? '?'}`);
  nuxtProc?.kill();
  process.exit(code ?? 1);
});

// --- Wait for Strapi health, then start Nuxt ---
console.log(
  `Waiting for Strapi at http://localhost:${strapiPort}/_health …\n`
);
await run('npx', [
  'wait-on',
  `http://localhost:${strapiPort}/_health`,
  '--timeout',
  '300000',
]);

const nuxtProc = spawnInherit('yarn', ['dev'], frontendDir);

nuxtProc.on('close', (code) => {
  console.error(`\n[nuxt] exited with code ${code ?? '?'}`);
  strapiProc.kill();
  process.exit(code ?? 1);
});

// Forward Ctrl+C to both children.
process.on('SIGINT', () => {
  strapiProc.kill('SIGINT');
  nuxtProc?.kill('SIGINT');
});
process.on('SIGTERM', () => {
  strapiProc.kill('SIGTERM');
  nuxtProc?.kill('SIGTERM');
});

// Keep this process alive until a child exits (handled above via process.exit).
await new Promise<void>(() => {});
