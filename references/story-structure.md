# Story structure and selector

The selector maps narration intent to a role and pattern:

| Intent | Pattern |
| --- | --- |
| why watch this match | `HOOK-01` or `HOOK-02` |
| where/when is it | `CTX-01` |
| why it matters | `STAKES-01` |
| recent form | `FORM-01` or `TEAM-01` |
| key person | `PLAYER-01` |
| decisive duel | `DUEL-01` |
| where players stand | `TACT-01` |
| how a move creates space | `TACT-02` |
| where the problem appears | `TACT-03` |
| one fact proves the claim | `DATA-01` |
| past meetings/record | `HIST-01` |
| final watch points | `OUT-01` |

Use the rhythm `HOOK → CONTEXT → EVIDENCE → EXPLANATION → EVIDENCE → EXPLANATION → SYNTHESIS`. A complete input has narration, target duration, available evidence, and optional asset inventory. If evidence is missing, keep the scene claim qualitative and mark the missing source rather than inventing a number.

The deterministic selector in `engine/src/selector.ts` is a baseline. Human overrides should be applied as a final, explicit pattern list rather than by changing the pattern registry at render time.
