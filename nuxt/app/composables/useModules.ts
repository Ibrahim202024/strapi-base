/**
 * Module-awareness composable.
 *
 * Provides a small API for querying which modules are enabled and their
 * capabilities. UI components use this instead of reading `neop.config.ts`
 * directly, keeping module checks centralised.
 */
import type {
  ModuleConfig,
  ModuleDefinition,
  ModuleName,
  NavContribution,
} from '#shared/modules';
import { MODULE_DEFINITIONS } from '#shared/module-defs/registry';
import neopConfig from '../../neop.config';

/** Enabled modules: merged config + definition, computed once. */
const enabledModules = Object.entries(neopConfig.modules)
  .filter(([_, cfg]) => cfg.enabled)
  .map(([name, cfg]) => ({
    name: name as ModuleName,
    config: cfg,
    definition: MODULE_DEFINITIONS[name as ModuleName],
  }));

/** Nav contributions from enabled modules. */
const navContributions: NavContribution[] = enabledModules
  .map((m) => m.definition.navContribution)
  .filter((c): c is NavContribution => c !== undefined);

export function useModules() {
  /** Whether a specific module is enabled. */
  function isEnabled(name: ModuleName): boolean {
    return neopConfig.modules[name]?.enabled === true;
  }

  /** Get a module's config, or `undefined` if not found. */
  function getConfig(name: ModuleName): ModuleConfig | undefined {
    return neopConfig.modules[name];
  }

  /** Get a module's definition, or `undefined` if not found. */
  function getDefinition(name: ModuleName): ModuleDefinition | undefined {
    return MODULE_DEFINITIONS[name];
  }

  /** Get the primary route for a module (e.g. `/blog`). */
  function getRoute(name: ModuleName): string | undefined {
    const cfg = neopConfig.modules[name];
    return cfg?.enabled ? cfg.route : undefined;
  }

  /** All enabled modules with their merged config + definition. */
  function getEnabledModules() {
    return enabledModules;
  }

  /** Nav contributions from all enabled modules. */
  function getNavContributions(): NavContribution[] {
    return navContributions;
  }

  return {
    isEnabled,
    getConfig,
    getDefinition,
    getRoute,
    getEnabledModules,
    getNavContributions,
  };
}
