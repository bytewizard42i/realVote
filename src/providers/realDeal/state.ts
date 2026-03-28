/**
 * RealDeal State Provider — LevelDB Private State
 *
 * Wraps midnight-js-level-private-state-provider for on-device encrypted storage.
 *
 * TODO: Wire up levelPrivateStateProvider from utils.ts
 */

import type { IStateProvider } from '../types.js';

export class RealDealStateProvider implements IStateProvider {
  async saveState(key: string, value: unknown): Promise<void> {
    // TODO: Use levelPrivateStateProvider for encrypted local storage
    throw new Error('RealDeal state not yet implemented — use demoLand mode for now');
  }

  async loadState<T>(key: string): Promise<T | null> {
    throw new Error('RealDeal state not yet implemented — use demoLand mode for now');
  }

  async clearState(): Promise<void> {
    throw new Error('RealDeal state not yet implemented — use demoLand mode for now');
  }
}
