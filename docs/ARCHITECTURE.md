# RealVotez Architecture — DIDzMonolith Ecosystem Integration

**RealVotez — Private Voting System on Midnight**
**Last Updated**: March 2026

---

## Overview

RealVotez is not a standalone voting tool. It is the **governance and decision-making engine** for the entire DIDzMonolith ecosystem — from municipal elections to DAO proposals to legal case management decisions.

What makes RealVotez different from every other blockchain voting system:

1. **Identity without exposure** — voters prove eligibility via DIDz/KYCz ZK proofs, never revealing who they are
2. **Jurisdiction-aware** — GeoZ integration ensures voters are in the correct district, state, or country
3. **AI-delegable** — AgenticDID allows humans to delegate voting rights to AI agents with cryptographic proof of authority
4. **Legally admissible** — AutoDiscovery.legal integration enables governance voting within active legal proceedings

---

## Ecosystem Integration Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RealVotez — Private Voting System                   │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  voting.      │  │  eligibility. │  │ results. │  │ delegation.   │  │
│  │  compact      │  │  compact      │  │ compact  │  │ compact       │  │
│  │              │  │              │  │          │  │               │  │
│  │ Registration │  │ KYCz check   │  │ Tally +  │  │ AI agent      │  │
│  │ MerkleTree   │  │ GeoZ check   │  │ Audit    │  │ proxy vote    │  │
│  │ Nullifiers   │  │ DIDz verify  │  │ Finalize │  │ with proof    │  │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  └───────┬───────┘  │
│         │                 │               │                │          │
└─────────┼─────────────────┼───────────────┼────────────────┼──────────┘
          │                 │               │                │
          ▼                 ▼               ▼                ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐
   │   DIDz.io    │  │   KYCz       │  │  ADL     │  │  AgenticDID  │
   │              │  │              │  │          │  │              │
   │  DID wallet  │  │  Age proof   │  │  Case    │  │  Delegation  │
   │  Credential  │  │  Residency   │  │  voting  │  │  chains      │
   │  folder      │  │  Citizenship │  │  results │  │  Credentials │
   └──────┬───────┘  └──────┬───────┘  └──────────┘  └──────────────┘
          │                 │
          ▼                 ▼
   ┌──────────────┐  ┌──────────────┐
   │   GeoZ       │  │  SafeHealth  │
   │              │  │  Data        │
   │  District    │  │              │
   │  proof       │  │  Board       │
   │  Jurisdiction│  │  elections   │
   └──────────────┘  └──────────────┘
```

---

## Integration Points

### 1. DIDz.io — Voter Identity

**Current**: Voters generate a raw `voterSecret` from a wallet seed. The creator registers voters by manually sharing commitment hashes out-of-band.

**With DIDz**: Voters already have a DIDz identity. Registration uses their existing DID credential, and the commitment is derived from their DID-bound public key.

```
Current Flow:
  Voter → generates secret → derives commitment → shares hex with creator → creator registers

DIDz Flow:
  Voter → presents DID credential → RealVotez verifies credential via sealed ledger call to DIDz
       → auto-derives commitment from DID public key → registers in MerkleTree
```

**Integration contract pattern**:
```compact
// Sealed ledger reference to the DIDz credential contract
sealed ledger didzCredentialContract: Bytes<32>;

// Voter registration checks DIDz credential validity
export circuit registerVoterByDID(voterDIDCommitment: Bytes<32>): [] {
  // Verify the DID commitment exists in the DIDz credential registry
  // Then register in local voter MerkleTree
}
```

**Value**: No more manual commitment sharing. Any DIDz holder can be registered as a voter. The DID commitment is their permanent identity anchor — reusable across elections.

---

### 2. KYCz — Voter Eligibility

**Current**: Any registered voter can vote. There's no eligibility verification — if the creator registers you, you're in.

**With KYCz**: Before registration (or before voting), the voter proves eligibility via KYCz ZK assertions:

| Assertion | Use Case |
|-----------|----------|
| `proveAgeAtLeast(18)` | Age requirement for municipal/national elections |
| `proveResidency("US")` | Citizenship requirement |
| `proveSanctionsClear()` | Not a sanctioned individual |
| `proveKycPassed(level)` | General KYC verification at required assurance level |
| `proveComposite(age + residency + sanctions)` | Combined multi-assertion eligibility |

**Integration pattern**:
```compact
// Eligibility check calls KYCz assertions before allowing registration
export circuit registerEligibleVoter(
    voterDIDCommitment: Bytes<32>,
    eligibilityProofHash: Bytes<32>
): [] {
  // 1. Verify voter has valid DIDz credential
  // 2. Verify KYCz eligibility proof (age >= 18 AND residency AND not sanctioned)
  // 3. Register voter commitment in MerkleTree
}
```

**Value**: Mathematically guaranteed voter eligibility without revealing any personal data. A voting booth proves "this person is a citizen over 18 who isn't sanctioned" — without learning their name, birthday, or address.

---

### 3. GeoZ — Jurisdiction-Aware Voting

**Current**: No geographic awareness. Any registered voter votes on any proposal.

**With GeoZ**: Voters prove they're in the correct jurisdiction before voting. Different proposals can require different geographic regions.

| Scenario | GeoZ Policy |
|----------|-------------|
| Municipal election | Prove residency in city limits |
| State ballot measure | Prove residency in state |
| DAO governance | Prove you're in a compliant jurisdiction |
| HOA vote | Prove residency in the subdivision |
| Corporate shareholder vote | Prove jurisdiction for regulatory compliance |

**Integration pattern**:
```compact
// Each proposal can specify a required GeoZ region
export ledger proposalRegionRoot: Maybe<Bytes<32>>;

export circuit voteWithJurisdiction(
    choice: VoteChoice,
    geoProofHash: Bytes<32>
): [] {
  // 1. Verify voter is registered (MerkleTree path)
  // 2. Verify GeoZ proof matches the proposal's required region
  // 3. Record vote
}
```

**Value**: A Colorado resident can't vote in a Texas election. A non-EU citizen can't vote on EU governance proposals. All enforced cryptographically — no honor system, no IP-based geolocation.

---

### 4. AgenticDID — AI Agent Proxy Voting

**Current**: Only human wallet holders can vote.

**With AgenticDID**: Humans can delegate voting authority to AI agents with cryptographic proof of delegation.

**Use cases**:
- **DAO governance**: An AI agent monitors proposals and votes according to pre-set parameters
- **Corporate proxy**: A shareholder delegates voting to an AI advisor
- **Accessibility**: A person with disabilities delegates to an AI agent that votes on their behalf
- **Time zones**: Delegate to an AI agent for proposals that close while you're asleep

**Integration pattern**:
```compact
// Delegation proof: human DID → agent DID with scoped authority
export circuit voteByProxy(
    choice: VoteChoice,
    delegatorDIDCommitment: Bytes<32>,
    agentDIDCommitment: Bytes<32>,
    delegationProofHash: Bytes<32>
): [] {
  // 1. Verify the agent has a valid AgenticDID credential
  // 2. Verify the delegation chain: human → agent with voting scope
  // 3. Use the HUMAN's nullifier (prevents both human and agent from voting)
  // 4. Record vote
}
```

**Key constraint**: The **delegator's** nullifier is used, not the agent's. This ensures the human can't vote AND have their agent vote — it's one vote per registered human, whether cast directly or by proxy.

**Value**: First voting system where AI agents can participate in governance with cryptographic proof of authority, full audit trail, and no possibility of unauthorized voting.

---

### 5. AutoDiscovery.legal — Legal Governance Voting

**Current**: RealVotez is generic — no domain-specific voting flows.

**With ADL**: RealVotez becomes the decision-making engine for legal proceedings:

| Legal Vote Type | Who Votes | What's Decided |
|----------------|-----------|----------------|
| Settlement approval | All parties | Accept/reject proposed settlement |
| Discovery scope | Attorneys + judge | Expand or narrow discovery requests |
| Protective order tier | Judge only | Classify document sensitivity |
| Expert witness approval | Both sides | Approve/reject expert qualifications |
| Case scheduling | All parties | Agree on timeline milestones |

**Integration pattern**:
```compact
// Case-bound voting: only registered case participants can vote
sealed ledger caseAccessControlContract: Bytes<32>;

export circuit voteOnCaseMatter(
    caseId: Bytes<32>,
    matterId: Bytes<32>,
    choice: VoteChoice
): [] {
  // 1. Verify voter is a registered participant in THIS case (via ADL access-control)
  // 2. Verify voter has the required role for this matter type
  // 3. Record vote with case + matter binding
}
```

**Value**: Legal decisions become cryptographically auditable. A judge's ruling on protective order tiers is recorded on-chain. Settlement votes are anonymous but verifiable.

---

## Use Case Matrix

| Use Case | DIDz | KYCz | GeoZ | AgenticDID | ADL |
|----------|------|------|------|------------|-----|
| Municipal election | ✅ Voter ID | ✅ Age + citizenship | ✅ District | ❌ | ❌ |
| DAO governance | ✅ Member ID | ❌ Optional | ✅ Jurisdiction | ✅ AI proxy | ❌ |
| Corporate shareholder | ✅ Identity | ✅ Accredited investor | ✅ Regulatory | ✅ Proxy | ❌ |
| HOA / condo board | ✅ Owner ID | ❌ | ✅ Property location | ❌ | ❌ |
| Legal settlement | ✅ Party ID | ❌ | ❌ | ❌ | ✅ Case binding |
| Healthcare board | ✅ Credential | ✅ Licensed provider | ✅ State license | ❌ | ❌ |
| Union vote | ✅ Member ID | ✅ Employment proof | ❌ | ❌ | ❌ |
| Research ethics board | ✅ Reviewer ID | ✅ Qualifications | ❌ | ❌ | ❌ |

---

## Contract Architecture (v2 Vision)

### Current: Single contract (`voting.compact`)
```
voting.compact
├── registerVoter()        — creator registers by commitment
├── startVoting()          — set proposal, open voting
├── vote()                 — anonymous YES/NO via ZK
└── closeVoting()          — close and finalize
```

### Target: Multi-contract system
```
voting-core.compact        — Base voting mechanics (MerkleTree, nullifiers, tally)
├── sealed ledger → eligibility-gate.compact
├── sealed ledger → delegation-registry.compact
└── sealed ledger → results-registry.compact

eligibility-gate.compact   — KYCz + GeoZ + DIDz eligibility checks
├── sealed ledger → KYCz anchor contract
├── sealed ledger → GeoZ proof log
└── sealed ledger → DIDz credential contract

delegation-registry.compact — AgenticDID proxy voting delegation
├── sealed ledger → AgenticDID registry
└── delegation chain verification

results-registry.compact   — Immutable results + audit trail
├── Historical results storage
└── ADL case-binding for legal governance
```

---

## Migration Path

### Phase 1: Current (Working)
- Single `voting.compact` with manual commitment registration
- DemoLand/RealDeal provider pattern ✅
- CLI for creator/voter interaction ✅

### Phase 2: DIDz Integration
- Replace manual commitment sharing with DIDz credential-based registration
- Voters use their existing DIDz identity
- Creator can register any DIDz holder by their public DID commitment

### Phase 3: KYCz + GeoZ Eligibility
- Add eligibility gates: age, citizenship, residency, jurisdiction
- GeoZ region requirement per proposal
- Composite assertion proofs for multi-requirement elections

### Phase 4: AgenticDID Delegation
- AI agent proxy voting with delegation chains
- Human nullifier binding (one vote per human, regardless of who casts it)
- Delegation scope limits (e.g., "agent can vote YES on proposals tagged 'routine'")

### Phase 5: ADL Legal Governance
- Case-bound voting for legal proceedings
- Role-gated vote types (judge-only, attorney-only, all-parties)
- Immutable audit trail for court records

---

## Security Considerations

### Sybil Resistance
- **KYCz biometric liveness** ensures one human = one identity
- **DIDz credential binding** prevents identity fabrication
- **Nullifier design** prevents double-voting even across identity delegation

### Coercion Resistance
- Voters cannot prove HOW they voted (only THAT they voted)
- Nullifiers are deterministic but unlinkable to identity
- No receipt or proof-of-vote that could be shown to a coercer

### Jurisdiction Enforcement
- GeoZ proofs are fresh (short expiry windows)
- VPN-resistant (ISP attestation uses physical access point)
- Multi-issuer policies for high-assurance elections

### Delegation Safety
- Delegation is revocable before the agent votes
- Human's nullifier is consumed (prevents both voting)
- Delegation scope can be constrained (topic, time, choice direction)

---

## Part of the DIDz Ecosystem

| Product | How RealVotez Uses It |
|---------|----------------|
| **[DIDz.io](https://github.com/bytewizard42i/didz-dapp-system)** | Voter identity — DID-based registration replaces manual commitment sharing |
| **[KYCz](https://github.com/bytewizard42i/KYCz_us_app)** | Eligibility proofs — age, citizenship, residency without revealing PII |
| **[GeoZ](https://github.com/bytewizard42i/GeoZ_us_app_Midnight-Oracle)** | Jurisdiction enforcement — prove district/state/country membership |
| **[AgenticDID](https://github.com/bytewizard42i/AgenticDID_io_me)** | Proxy voting — AI agents vote on behalf of humans with delegation proof |
| **[AutoDiscovery.legal](https://github.com/bytewizard42i/autoDiscovery_legal)** | Legal governance — case-bound voting for settlements, discovery, scheduling |
| **[SentinelAI](https://github.com/bytewizard42i/SentinelAI)** | DAO treasury governance voting with AI advisory tiers |
| **[HuddleBridge](https://github.com/bytewizard42i/huddlebridge_app_me_us)** | Live event polls with DIDz-verified participants |
| **[SafeHealthData](https://github.com/bytewizard42i/safeHealthData_me)** | Healthcare board elections, ethics committee votes |

---

*EnterpriseZK Labs LLC — Built on Midnight. Powered by Cardano. Protected by zero-knowledge cryptography.*
