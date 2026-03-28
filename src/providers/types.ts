/**
 * RealVotez Provider Interfaces
 *
 * Abstract contracts for the voting system. Both demoLand (mock) and
 * realDeal (Midnight) providers implement these same interfaces.
 *
 * This is the DemoLand/RealDeal pattern used across the DIDzMonolith ecosystem:
 * define interfaces once, implement twice — swap at runtime via config.
 */

// ─── Data Types ────────────────────────────────────────────────────────────────

export type VoteChoice = 'YES' | 'NO';
export type Phase = 'REGISTRATION' | 'VOTING' | 'CLOSED';

export interface Proposal {
  title: string;
  description: string;
}

export interface VoteResults {
  yesVotes: number;
  noVotes: number;
  totalVoters: number;
  phase: Phase;
  proposal: Proposal | null;
}

export interface VoterIdentity {
  /** Hex-encoded secret key (derived from wallet seed or generated) */
  secretKey: string;
  /** Hex-encoded public key (derived from secret key) */
  publicKey: string;
  /** Hex-encoded commitment (derived from public key) */
  commitment: string;
}

export interface ContractState {
  phase: Phase;
  proposal: Proposal | null;
  yesVotes: number;
  noVotes: number;
  registeredVoterCount: number;
  nullifierCount: number;
}

// ─── Auth Provider ─────────────────────────────────────────────────────────────

export interface IAuthProvider {
  /** Create a new identity (wallet in realDeal, generated keys in demoLand) */
  createIdentity(seed?: string): Promise<VoterIdentity>;

  /** Restore an existing identity from a seed/secret */
  restoreIdentity(seed: string): Promise<VoterIdentity>;

  /** Get the current identity (null if not authenticated) */
  getCurrentIdentity(): VoterIdentity | null;

  /** Check if the current identity is the contract creator */
  isCreator(): Promise<boolean>;
}

// ─── Voting Provider ───────────────────────────────────────────────────────────

export interface IVotingProvider {
  /** Deploy a new voting contract — returns a contract address/ID */
  deployContract(): Promise<string>;

  /** Connect to an existing deployed contract */
  connectToContract(contractAddress: string): Promise<void>;

  /** Register a voter by their commitment hex */
  registerVoter(commitmentHex: string): Promise<void>;

  /** Start the voting phase with a proposal */
  startVoting(proposal: Proposal): Promise<void>;

  /** Cast a vote (YES or NO) */
  castVote(choice: VoteChoice): Promise<void>;

  /** Close the voting phase */
  closeVoting(): Promise<void>;

  /** Get current contract state (phase, votes, proposal) */
  getContractState(): Promise<ContractState>;

  /** Get vote results */
  getResults(): Promise<VoteResults>;
}

// ─── State Provider ────────────────────────────────────────────────────────────

export interface IStateProvider {
  /** Save state to persistent storage (file in demoLand, level in realDeal) */
  saveState(key: string, value: unknown): Promise<void>;

  /** Load state from persistent storage */
  loadState<T>(key: string): Promise<T | null>;

  /** Clear all persisted state */
  clearState(): Promise<void>;
}

// ─── Ecosystem Integration Providers (v2) ─────────────────────────────────────

/**
 * DIDz Integration — Voter identity via DIDz credentials.
 * Replaces manual commitment sharing with DID-based registration.
 * Powered by: DIDz.io (https://github.com/bytewizard42i/didz-dapp-system)
 */
export interface IDIDzProvider {
  /** Verify a voter has a valid DIDz credential */
  verifyDIDCredential(didCommitment: string): Promise<boolean>;

  /** Derive voter commitment from DIDz public key */
  deriveVoterCommitmentFromDID(didCommitment: string): Promise<string>;

  /** Register a voter by their DIDz credential (replaces manual commitment sharing) */
  registerVoterByDID(didCommitment: string): Promise<void>;
}

/**
 * KYCz Integration — Voter eligibility verification via ZK assertions.
 * Proves age, citizenship, residency without revealing PII.
 * Powered by: KYCz (https://github.com/bytewizard42i/KYCz_us_app)
 */
export interface IEligibilityProvider {
  /** Verify voter meets age requirement (e.g., proveAgeAtLeast(18)) */
  verifyAge(didCommitment: string, minimumAge: number): Promise<boolean>;

  /** Verify voter residency in a specific country/state */
  verifyResidency(didCommitment: string, jurisdictionCode: string): Promise<boolean>;

  /** Verify voter passes KYC at required assurance level */
  verifyKYC(didCommitment: string, assuranceLevel: number): Promise<boolean>;

  /** Verify composite eligibility (age + residency + sanctions clear) */
  verifyCompositeEligibility(didCommitment: string, requirements: EligibilityRequirements): Promise<boolean>;
}

export interface EligibilityRequirements {
  minimumAge?: number;
  requiredResidency?: string;
  kycAssuranceLevel?: number;
  sanctionsClear?: boolean;
}

/**
 * GeoZ Integration — Jurisdiction-aware voting.
 * Proves voter is in the correct district, state, or country (VPN-resistant).
 * Powered by: GeoZ (https://github.com/bytewizard42i/GeoZ_us_app_Midnight-Oracle)
 */
export interface IJurisdictionProvider {
  /** Verify voter is within the required region for a proposal */
  verifyJurisdiction(didCommitment: string, regionRoot: string): Promise<boolean>;

  /** Get the GeoZ region root for a specific geographic area */
  getRegionRoot(jurisdictionCode: string): Promise<string>;
}

/**
 * AgenticDID Integration — AI agent proxy voting with delegation proofs.
 * Humans delegate voting to AI agents with cryptographic proof of authority.
 * Powered by: AgenticDID (https://github.com/bytewizard42i/AgenticDID_io_me)
 */
export interface IDelegationProvider {
  /** Verify an AI agent has valid delegation from a human voter */
  verifyDelegation(agentDID: string, delegatorDID: string): Promise<boolean>;

  /** Get the human delegator's commitment (for nullifier binding) */
  getDelegatorCommitment(agentDID: string): Promise<string>;

  /** Check delegation scope (can this agent vote on this proposal type?) */
  checkDelegationScope(agentDID: string, proposalTags: string[]): Promise<boolean>;
}

// ─── Combined Provider ─────────────────────────────────────────────────────────

export interface IRealVotezProviders {
  auth: IAuthProvider;
  voting: IVotingProvider;
  state: IStateProvider;
  mode: 'demoLand' | 'realDeal';

  // v2 ecosystem integration (optional — null until Phase 2+)
  didz?: IDIDzProvider;
  eligibility?: IEligibilityProvider;
  jurisdiction?: IJurisdictionProvider;
  delegation?: IDelegationProvider;
}
