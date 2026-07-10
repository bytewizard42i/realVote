# HelixChain Integration (pointer)

**realVote** integrates with **HelixChain**, the ecosystem's privacy-preserving
data plane + AI agent (powered by **DIDz + AgenticDID + RWAz + HelixChain**).

**This repo primarily writes:** `identities` (voters) + `credentials`
(eligibility as a **VC** — e.g. `voter_eligibility`, `residency`). Votes
themselves are anonymous, nullifier-based, and settle on **Midnight** — HelixChain
holds eligibility claims and tallies metadata, never a voter→ballot link.

**Integration contract (summary):**
- every voter/holder is a 32-byte **commitment**, never a name
- use the identity layer (DIDz ⇄ tID swappable at runtime) — never hard-code a provider
- store **coarse** data only + a `*_hash` anchor; never link identity to ballot
- pick the right class: **DIDz** identity / **VC** credential / **RWAz** asset / **AgenticDID** grant

**Canonical integration schema:** `helixchain/docs/HELIXCHAIN_INTEGRATION.md`
**Alternate-ID (tDIDz) scheme:** `helixchain/docs/IDENTITY_PLACEHOLDER_SCHEME.md`
(local pointer: `docs/TEMP_ID_PLACEHOLDER.md`)
