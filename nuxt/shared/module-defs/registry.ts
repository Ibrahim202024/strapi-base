/**
 * Module Registry
 *
 * Central lookup of all module definitions. Adding a new module means:
 *   1. Creating `shared/module-defs/<name>.ts` with a ModuleDefinition
 *   2. Importing and registering it here
 *   3. Adding its `ModuleName` to the union in `shared/modules.ts`
 *   4. Adding its configuration to `neop.config.ts`
 *
 * The registry only describes what modules *exist*. Whether they are enabled
 * is determined by `neop.config.ts`.
 */
import type { ModuleDefinition, ModuleName } from '../modules';
import { authModule } from './auth';
import { blogModule } from './blog';
import { shopModule } from './shop';

export const MODULE_DEFINITIONS: Record<ModuleName, ModuleDefinition> = {
  blog: blogModule,
  auth: authModule,
  shop: shopModule,

  // Future modules — add definitions here when implemented.
  // Until then, minimal stubs satisfy the Record<ModuleName, ...> constraint.
  services: { name: 'services', reservedSegments: ['services'] },
  portfolio: { name: 'portfolio', reservedSegments: ['portfolio'] },
  team: { name: 'team', reservedSegments: ['team'] },
  careers: { name: 'careers', reservedSegments: ['careers'] },
};
