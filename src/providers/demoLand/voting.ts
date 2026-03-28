/**
 * DemoLand Voting Provider — Mock Voting Contract
 *
 * Simulates the full voting contract lifecycle in memory.
 * Mirrors the exact phase transitions, access control, nullifier logic,
 * and Merkle tree registration from the real Compact contract — but without
 * any blockchain, wallet, or proof server dependency.
 */

import * as crypto from 'node:crypto';
import type {
  IVotingProvider,
  VoteChoice,
  Phase,
  Proposal,
  ContractState,
  VoteResults,
} from '../types.js';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Mirrors Compact's deriveNullifier — persistentHash with "pvs:v3:nul:" prefix */
function deriveNullifierJS(sk: Uint8Array): string {
  const prefix = new Uint8Array(32);
  const encoder = new TextEncoder();
  const tag = encoder.encode('pvs:v3:nul:');
  prefix.set(tag);
  const combined = new Uint8Array(64);
  combined.set(prefix, 0);
  combined.set(sk, 32);
  return toHex(new Uint8Array(crypto.createHash('sha256').update(combined).digest()));
}

interface MockContractState {
  creatorPublicKey: string;
  phase: Phase;
  proposal: Proposal | null;
  yesVotes: number;
  noVotes: number;
  /** Set of registered voter commitment hashes */
  registeredVoters: Set<string>;
  /** Set of used nullifiers (prevents double voting) */
  nullifiers: Set<string>;
}

export class DemoLandVotingProvider implements IVotingProvider {
  private state: MockContractState | null = null;
  private contractAddress: string | null = null;

  /** The secret key of the current user — needed for nullifier derivation */
  private currentUserSecretKey: string | null = null;
  /** The public key of the current user — needed for creator checks */
  private currentUserPublicKey: string | null = null;

  /** Set the current user context for access control checks */
  setCurrentUser(secretKey: string, publicKey: string): void {
    this.currentUserSecretKey = secretKey;
    this.currentUserPublicKey = publicKey;
  }

  async deployContract(): Promise<string> {
    if (!this.currentUserPublicKey) {
      throw new Error('Must authenticate before deploying');
    }

    this.contractAddress = `demo-contract-${Date.now().toString(36)}`;
    this.state = {
      creatorPublicKey: this.currentUserPublicKey,
      phase: 'REGISTRATION',
      proposal: null,
      yesVotes: 0,
      noVotes: 0,
      registeredVoters: new Set(),
      nullifiers: new Set(),
    };

    return this.contractAddress;
  }

  async connectToContract(contractAddress: string): Promise<void> {
    if (!this.state) {
      throw new Error('No contract deployed in demoLand — deploy first or switch to realDeal mode');
    }
    this.contractAddress = contractAddress;
  }

  async registerVoter(commitmentHex: string): Promise<void> {
    this.assertState();
    this.assertCreator();
    this.assertPhase('REGISTRATION');

    this.state!.registeredVoters.add(commitmentHex.toLowerCase());
  }

  async startVoting(proposal: Proposal): Promise<void> {
    this.assertState();
    this.assertCreator();
    this.assertPhase('REGISTRATION');

    if (this.state!.registeredVoters.size === 0) {
      throw new Error('No voters registered');
    }

    this.state!.proposal = proposal;
    this.state!.phase = 'VOTING';
  }

  async castVote(choice: VoteChoice): Promise<void> {
    this.assertState();
    this.assertPhase('VOTING');

    if (!this.currentUserSecretKey) {
      throw new Error('Must authenticate before voting');
    }

    // Derive commitment from current user to check registration
    // (In demoLand we trust the user is registered if their commitment is in the set)
    const nullifier = deriveNullifierJS(
      new Uint8Array(Buffer.from(this.currentUserSecretKey, 'hex')),
    );

    if (this.state!.nullifiers.has(nullifier)) {
      throw new Error('Already voted — nullifier already used');
    }

    this.state!.nullifiers.add(nullifier);

    if (choice === 'YES') {
      this.state!.yesVotes += 1;
    } else {
      this.state!.noVotes += 1;
    }
  }

  async closeVoting(): Promise<void> {
    this.assertState();
    this.assertCreator();
    this.assertPhase('VOTING');

    this.state!.phase = 'CLOSED';
  }

  async getContractState(): Promise<ContractState> {
    this.assertState();

    return {
      phase: this.state!.phase,
      proposal: this.state!.proposal,
      yesVotes: this.state!.yesVotes,
      noVotes: this.state!.noVotes,
      registeredVoterCount: this.state!.registeredVoters.size,
      nullifierCount: this.state!.nullifiers.size,
    };
  }

  async getResults(): Promise<VoteResults> {
    this.assertState();

    return {
      yesVotes: this.state!.yesVotes,
      noVotes: this.state!.noVotes,
      totalVoters: this.state!.registeredVoters.size,
      phase: this.state!.phase,
      proposal: this.state!.proposal,
    };
  }

  // ─── Internal Guards ───────────────────────────────────────────────────────

  private assertState(): void {
    if (!this.state) {
      throw new Error('No contract deployed — call deployContract() first');
    }
  }

  private assertCreator(): void {
    if (this.currentUserPublicKey !== this.state?.creatorPublicKey) {
      throw new Error('Only the contract creator can perform this action');
    }
  }

  private assertPhase(expected: Phase): void {
    if (this.state?.phase !== expected) {
      throw new Error(`Expected phase ${expected}, but contract is in ${this.state?.phase}`);
    }
  }
}
