/**
 * DemoLand Auth Provider — Mock Identity Management
 *
 * Simulates wallet/identity operations without any blockchain dependency.
 * Generates deterministic keys from seeds using the same hash derivation
 * as the real Compact contract, so commitments are compatible.
 */

import * as crypto from 'node:crypto';
import type { IAuthProvider, VoterIdentity } from '../types.js';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Mirrors the Compact contract's persistentHash derivation for public keys */
function derivePublicKeyJS(sk: Uint8Array): Uint8Array {
  const prefix = new Uint8Array(32);
  const encoder = new TextEncoder();
  const tag = encoder.encode('pvs:v3:pk:');
  prefix.set(tag);
  const combined = new Uint8Array(64);
  combined.set(prefix, 0);
  combined.set(sk, 32);
  return new Uint8Array(crypto.createHash('sha256').update(combined).digest());
}

/** Mirrors the Compact contract's persistentHash derivation for commitments */
function deriveCommitmentJS(pk: Uint8Array): Uint8Array {
  const prefix = new Uint8Array(32);
  const encoder = new TextEncoder();
  const tag = encoder.encode('pvs:v3:vc:');
  prefix.set(tag);
  const combined = new Uint8Array(64);
  combined.set(prefix, 0);
  combined.set(pk, 32);
  return new Uint8Array(crypto.createHash('sha256').update(combined).digest());
}

export class DemoLandAuthProvider implements IAuthProvider {
  private currentIdentity: VoterIdentity | null = null;
  private creatorPublicKey: string | null = null;

  /** Set the creator's public key for isCreator() checks */
  setCreatorPublicKey(publicKey: string): void {
    this.creatorPublicKey = publicKey;
  }

  async createIdentity(seed?: string): Promise<VoterIdentity> {
    const actualSeed = seed || crypto.randomBytes(32).toString('hex');
    const sk = new Uint8Array(crypto.createHash('sha256').update(actualSeed).digest());
    const pk = derivePublicKeyJS(sk);
    const commitment = deriveCommitmentJS(pk);

    this.currentIdentity = {
      secretKey: toHex(sk),
      publicKey: toHex(pk),
      commitment: toHex(commitment),
    };

    return this.currentIdentity;
  }

  async restoreIdentity(seed: string): Promise<VoterIdentity> {
    return this.createIdentity(seed);
  }

  getCurrentIdentity(): VoterIdentity | null {
    return this.currentIdentity;
  }

  async isCreator(): Promise<boolean> {
    if (!this.currentIdentity || !this.creatorPublicKey) return false;
    return this.currentIdentity.publicKey === this.creatorPublicKey;
  }
}
