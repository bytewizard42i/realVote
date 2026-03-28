/**
 * realVote Configuration — Mode Switch
 *
 * Controls whether the app runs in demoLand (mock) or realDeal (Midnight) mode.
 * Set via REALVOTE_MODE environment variable or defaults to 'demoLand'.
 *
 * demoLand: Full functionality with simulated blockchain — no wallet, no Docker, no tokens needed.
 * realDeal: Real Midnight Preprod integration — requires wallet, proof server, tNight tokens.
 */

export type AppMode = 'demoLand' | 'realDeal';

export const APP_MODE: AppMode = (process.env.REALVOTE_MODE as AppMode) || 'demoLand';

export const isDemoLand = APP_MODE === 'demoLand';
export const isRealDeal = APP_MODE === 'realDeal';

/** Preprod network endpoints — only used in realDeal mode */
export const NETWORK_CONFIG = {
  indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: process.env.PROOF_SERVER_URL || 'http://127.0.0.1:6300',
  faucet: 'https://faucet.preprod.midnight.network/',
};

console.log(`\n🔧 realVote running in ${APP_MODE === 'demoLand' ? '🏰 demoLand (mock)' : '⛓️ realDeal (Midnight Preprod)'} mode\n`);
