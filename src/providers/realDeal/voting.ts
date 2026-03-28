/**
 * RealDeal Voting Provider — Midnight Compact Contract Integration
 *
 * Wraps the real deployed voting.compact contract on Preprod.
 * Requires: compiled contract, proof server, funded wallet, network.
 *
 * TODO: Wire up findDeployedContract, createProviders, witnesses from utils.ts
 */

import type {
  IVotingProvider,
  VoteChoice,
  Proposal,
  ContractState,
  VoteResults,
} from '../types.js';

export class RealDealVotingProvider implements IVotingProvider {
  async deployContract(): Promise<string> {
    // TODO: Use getCompiledContract() + createProviders() from utils.ts
    // TODO: Deploy via deployContract() with initial private state
    // TODO: Return the on-chain contract address
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }

  async connectToContract(contractAddress: string): Promise<void> {
    // TODO: Use findDeployedContract() from midnight-js-contracts
    // TODO: Set up contract context with providers and witnesses
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }

  async registerVoter(commitmentHex: string): Promise<void> {
    // TODO: Call contract.registerVoter() circuit
    // TODO: Set pendingCommitment in private state before calling
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }

  async startVoting(proposal: Proposal): Promise<void> {
    // TODO: Call contract.startVoting(title, description) circuit
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }

  async castVote(choice: VoteChoice): Promise<void> {
    // TODO: Call contract.vote(VoteChoice.YES or VoteChoice.NO) circuit
    // TODO: Witness provides voterSecret, findVoterPath for Merkle proof
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }

  async closeVoting(): Promise<void> {
    // TODO: Call contract.closeVoting() circuit
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }

  async getContractState(): Promise<ContractState> {
    // TODO: Read ledger state from indexer via publicDataProvider
    // TODO: Map on-chain phase/votes/proposal to ContractState interface
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }

  async getResults(): Promise<VoteResults> {
    // TODO: Read final vote tallies from on-chain state
    throw new Error('RealDeal voting not yet implemented — use demoLand mode for now');
  }
}
