/**
 * RealDeal Auth Provider — Midnight Wallet Integration
 *
 * Wraps the real Midnight wallet SDK for identity management on Preprod.
 * Requires: funded wallet, proof server running, network connectivity.
 *
 * TODO: Wire up createWallet() and deriveKeys() from utils.ts
 */

import type { IAuthProvider, VoterIdentity } from '../types.js';

export class RealDealAuthProvider implements IAuthProvider {
  private currentIdentity: VoterIdentity | null = null;

  async createIdentity(seed?: string): Promise<VoterIdentity> {
    // TODO: Generate or use provided seed
    // TODO: Call createWallet(seed) from utils.ts
    // TODO: Derive pk/commitment using the same hash functions as the contract
    // TODO: Fund wallet via faucet if new
    throw new Error('RealDeal auth not yet implemented — use demoLand mode for now');
  }

  async restoreIdentity(seed: string): Promise<VoterIdentity> {
    // TODO: Call createWallet(seed) from utils.ts to restore
    throw new Error('RealDeal auth not yet implemented — use demoLand mode for now');
  }

  getCurrentIdentity(): VoterIdentity | null {
    return this.currentIdentity;
  }

  async isCreator(): Promise<boolean> {
    // TODO: Compare current wallet's derived public key against on-chain creator field
    throw new Error('RealDeal auth not yet implemented — use demoLand mode for now');
  }
}
