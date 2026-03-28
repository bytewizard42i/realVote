# realVote — Private Voting System on Midnight

> **The governance and decision-making engine for the DIDzMonolith ecosystem.**

A zero-knowledge private voting system for the Midnight blockchain. Voters prove eligibility via DIDz credentials, cast anonymous votes using ZK proofs, and nullifiers prevent double-voting — all without revealing voter identity.

**Website**: [enterprisezk.com](https://enterprisezk.com)
**Company**: [EnterpriseZK Labs LLC](https://enterprisezk.com) — Pennsylvania, USA
**Blockchain**: [Midnight Network](https://midnight.network) (Cardano ecosystem)
**Status**: Core contract deployed to Preprod · Ecosystem integration in progress

---

## What Makes realVote Different

Every blockchain voting system claims "private voting." realVote is the only one that integrates:

| Capability | How | Powered By |
|-----------|-----|------------|
| **Identity without exposure** | Voters prove eligibility via ZK proofs, never revealing who they are | [DIDz.io](https://github.com/bytewizard42i/didz-dapp-system) |
| **Verified eligibility** | Prove age, citizenship, residency without revealing PII | [KYCz](https://github.com/bytewizard42i/KYCz_us_app) |
| **Jurisdiction enforcement** | Prove you're in the correct district, state, or country (VPN-resistant) | [GeoZ](https://github.com/bytewizard42i/GeoZ_us_app_Midnight-Oracle) |
| **AI-delegable governance** | Humans delegate voting to AI agents with cryptographic proof of authority | [AgenticDID](https://github.com/bytewizard42i/AgenticDID_io_me) |
| **Legally admissible** | Governance voting within active legal proceedings | [AutoDiscovery.legal](https://github.com/bytewizard42i/autoDiscovery_legal) |

---

## Use Cases

| Use Case | DIDz | KYCz | GeoZ | AgenticDID | ADL |
|----------|:----:|:----:|:----:|:----------:|:---:|
| Municipal election | ✅ | ✅ Age + citizenship | ✅ District | — | — |
| DAO governance | ✅ | Optional | ✅ Jurisdiction | ✅ AI proxy | — |
| Corporate shareholder vote | ✅ | ✅ Accredited investor | ✅ Regulatory | ✅ Proxy | — |
| HOA / condo board | ✅ | — | ✅ Property | — | — |
| Legal settlement approval | ✅ | — | — | — | ✅ Case-bound |
| Healthcare board election | ✅ | ✅ Licensed provider | ✅ State license | — | — |
| Union vote | ✅ | ✅ Employment proof | — | — | — |
| Live event polls ([HuddleBridge](https://github.com/bytewizard42i/huddlebridge_app_me_us)) | ✅ | — | — | — | — |
| AI treasury governance ([SentinelAI](https://github.com/bytewizard42i/SentinelAI)) | ✅ | — | — | ✅ | — |

---

## Prerequisites

- **Node.js v22+** (`nvm install 22`)
- **Docker** (for the proof server — realDeal mode only)
- **Compact compiler** — See [Midnight docs](https://docs.midnight.network/) for installation

## Quick Start

```bash
# Install dependencies
npm install

# Run in demoLand (no wallet, no Docker, no tokens needed)
npm run cli

# — OR — Run in realDeal (real Midnight Preprod)
REALVOTE_MODE=realDeal npm run compile
REALVOTE_MODE=realDeal npm run proof-server:start
REALVOTE_MODE=realDeal npm run deploy
REALVOTE_MODE=realDeal npm run cli
```

**DemoLand mode** gives you full functionality with simulated blockchain — perfect for development and demos.
**RealDeal mode** connects to Midnight Preprod — requires wallet, proof server, and tNight tokens.

---

## Project Structure

```
privateVotingSystem/
├── contracts/
│   ├── voting.compact             # Core voting contract (Compact lang)
│   └── hello-world.compact        # Minimal hello-world example
├── docs/
│   └── ARCHITECTURE.md            # Ecosystem integration architecture
├── src/
│   ├── config.ts                  # DemoLand/RealDeal mode switch
│   ├── deploy.ts                  # Deployment script
│   ├── cli.ts                     # Interactive CLI (creator + voter flows)
│   ├── utils.ts                   # Wallet, providers, witnesses, helpers
│   └── providers/
│       ├── types.ts               # Provider interfaces (shared by both modes)
│       ├── index.ts               # Provider factory
│       ├── demoLand/              # Mock providers (no blockchain needed)
│       └── realDeal/              # Real Midnight Preprod providers
├── docker-compose.yml             # Proof server config
└── package.json
```

---

## How It Works

### Contract Phases

| Phase | Description |
|-------|-------------|
| **REGISTRATION** | Creator registers voters by commitment hash (v1) or DIDz credential (v2) |
| **VOTING** | Registered voters cast anonymous YES/NO votes via ZK proofs |
| **CLOSED** | Creator closes the vote; results are final |

### Privacy Model

- **Voter identity** is never revealed on-chain. Votes are linked to a Merkle proof of registration, not a wallet address.
- **Nullifiers** derived from voter secrets prevent double-voting without revealing who voted.
- **Commitments** are stored in a `HistoricMerkleTree` — only the tree root is checked during voting.
- **Vote direction** (YES/NO) is disclosed to the tally, but **cannot be linked** to any voter identity.

### Key Circuits

| Circuit | Access | Description |
|---------|--------|-------------|
| `registerVoter` | Creator only | Adds a voter commitment to the Merkle tree |
| `startVoting` | Creator only | Sets proposal title/description, opens voting |
| `vote` | Any registered voter | Casts an anonymous YES or NO vote via ZK proof |
| `closeVoting` | Creator only | Closes the voting phase |

### Privacy Patterns Used

From Chapter 7 of *How to Code with Midnight*:

- **Pattern 4**: Merkle Tree Role Proofs — voter proves registration without revealing identity
- **Pattern 8**: Commitment/Nullifier — one vote per person without identity exposure
- **Pattern 1**: Jurisdiction-Aware Compliance (v2 — GeoZ integration)
- **Pattern 6**: Spoof Transactions (v2 — prevents voting pattern analysis)

---

## Ecosystem Integration (v2 Roadmap)

### Current (v1) — Working

The core voting contract is deployed and functional:
- Manual commitment-based voter registration
- Anonymous YES/NO voting via ZK proofs
- Nullifier-based double-vote prevention
- DemoLand/RealDeal dual-mode provider pattern

### Phase 2 — DIDz Credential-Based Registration

Replace manual commitment sharing with DIDz credential-based registration. Voters use their existing DIDz identity — no out-of-band commitment exchange needed.

### Phase 3 — KYCz + GeoZ Eligibility Gates

Add eligibility proofs before registration:
- "Is this voter over 18?" (KYCz age assertion)
- "Is this voter a citizen?" (KYCz residency assertion)
- "Is this voter in the correct district?" (GeoZ region proof)

### Phase 4 — AgenticDID Proxy Voting

AI agents can vote on behalf of humans with:
- Cryptographic delegation proof (human → agent)
- Human's nullifier consumed (prevents both voting)
- Scoped delegation (topic, time, choice constraints)

### Phase 5 — ADL Legal Governance

Case-bound voting for legal proceedings:
- Settlement approval, discovery scope decisions, scheduling
- Role-gated vote types (judge-only, attorney-only, all-parties)
- Immutable audit trail for court records

> 📐 **[Full Architecture Documentation →](./docs/ARCHITECTURE.md)**

---

## CLI

The CLI auto-detects your role (creator vs voter) based on your wallet seed.

**Creator menu:**
1. Register self
2. Register another voter (by commitment hex)
3. Start voting (set proposal)
4. Vote YES / NO
5. Close voting
6. View results

**Voter menu:**
1. Show commitment (share with creator for registration)
2. Vote YES / NO
3. View results

---

## Deployment Flow

1. **Compile** — Generates ZK circuits in `contracts/managed/voting/`
2. **Start proof server** — Required for generating ZK proofs (realDeal only)
3. **Deploy** — Creates/restores wallet, funds via faucet, deploys contract
4. **Interact** — Register voters, start proposals, vote, and close via CLI

## Wallet & Funding (RealDeal Mode)

- Choose to create a new wallet or restore from a hex seed
- New wallets generate a 64-character hex seed — **save it**
- Fund at: https://faucet.preprod.midnight.network/
- DUST tokens are auto-registered from your tNight balance

## Network

Targets **Preprod** testnet:

- Indexer: `https://indexer.preprod.midnight.network`
- RPC: `https://rpc.preprod.midnight.network`
- Faucet: https://faucet.preprod.midnight.network/

## Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile the Compact contract |
| `npm run deploy` | Deploy contract to Preprod |
| `npm run cli` | Interactive CLI (auto-detects demoLand/realDeal) |
| `npm run proof-server:start` | Start proof server (Docker) |
| `npm run proof-server:stop` | Stop proof server |

---

## Part of the DIDz Ecosystem

realVote is the governance layer for [EnterpriseZK Labs](https://enterprisezk.com):

| Product | How It Uses realVote |
|---------|----------------|
| **[DIDz.io](https://github.com/bytewizard42i/didz-dapp-system)** | DID-based voter registration |
| **[KYCz](https://github.com/bytewizard42i/KYCz_us_app)** | Voter eligibility proofs (age, citizenship, residency) |
| **[GeoZ](https://github.com/bytewizard42i/GeoZ_us_app_Midnight-Oracle)** | Jurisdiction-aware voting (district/state enforcement) |
| **[AgenticDID](https://github.com/bytewizard42i/AgenticDID_io_me)** | AI agent proxy voting with delegation proofs |
| **[AutoDiscovery.legal](https://github.com/bytewizard42i/autoDiscovery_legal)** | Legal case governance voting |
| **[SentinelAI](https://github.com/bytewizard42i/SentinelAI)** | DAO treasury governance with AI advisory tiers |
| **[HuddleBridge](https://github.com/bytewizard42i/huddlebridge_app_me_us)** | Live event polls with verified participants |
| **[SafeHealthData](https://github.com/bytewizard42i/safeHealthData_me)** | Healthcare board elections, ethics committee votes |

---

## License

MIT

---

*EnterpriseZK Labs LLC — Built on Midnight. Powered by Cardano. Protected by zero-knowledge cryptography.*
