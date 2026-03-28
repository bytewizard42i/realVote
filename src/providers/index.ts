/**
 * PVS Provider Factory
 *
 * Returns the correct provider bundle based on APP_MODE.
 * Import this from anywhere in the app to get the right providers.
 *
 * Usage:
 *   import { createProviders } from './providers/index.js';
 *   const providers = createProviders();
 *   await providers.auth.createIdentity();
 *   await providers.voting.deployContract();
 */

import { APP_MODE } from '../config.js';
import type { IPVSProviders } from './types.js';

import { DemoLandAuthProvider, DemoLandVotingProvider, DemoLandStateProvider } from './demoLand/index.js';
import { RealDealAuthProvider, RealDealVotingProvider, RealDealStateProvider } from './realDeal/index.js';

export function createPVSProviders(): IPVSProviders {
  if (APP_MODE === 'demoLand') {
    const auth = new DemoLandAuthProvider();
    const voting = new DemoLandVotingProvider();
    const state = new DemoLandStateProvider();
    return { auth, voting, state, mode: 'demoLand' };
  }

  // realDeal — real Midnight Preprod integration
  const auth = new RealDealAuthProvider();
  const voting = new RealDealVotingProvider();
  const state = new RealDealStateProvider();
  return { auth, voting, state, mode: 'realDeal' };
}

export type { IPVSProviders, IAuthProvider, IVotingProvider, IStateProvider } from './types.js';
export type { VoteChoice, Phase, Proposal, ContractState, VoteResults, VoterIdentity } from './types.js';
