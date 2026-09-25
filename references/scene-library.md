# Scene Library v0.1

The selector chooses a pattern from narrative intent. The pattern owns layer responsibilities, asset boundaries, motion, and a duration range. Do not use all patterns by default.

| ID | Use | Typical duration |
| --- | --- | ---: |
| `HOOK-01` | match slam and opening promise | 2.5–4s |
| `HOOK-02` | one core question | 3–5s |
| `CTX-01` | place, stadium, date, match context | 3–5s |
| `STAKES-01` | title race, qualification, relegation, derby stakes | 4–6s |
| `TEAM-01` | one-sentence team snapshot | 4–6s |
| `FORM-01` | recent results or goal trend | 3–5s |
| `PLAYER-01` | key player or coach spotlight | 4–6s |
| `DUEL-01` | decisive player-versus-player battle | 5–7s |
| `TACT-01` | formation and starting positions | 4–7s |
| `TACT-02` | movement mechanism and timing | 5–8s |
| `TACT-03` | exposed or decisive space | 3–6s |
| `DATA-01` | one statistical contrast or delta | 3–5s |
| `HIST-01` | relevant H2H or record timeline | 4–6s |
| `OUT-01` | three watch points plus match callback | 4–6s |

## Pattern contract

Each pattern must state: narration intent, L0–L3 contents, what an image provider may generate, what Remotion must generate, motion preset IDs, and duration. `TACT-01`, `TACT-02`, and `TACT-03` are fully programmatic. `DATA-01` must answer one question; never turn it into a multi-metric dashboard.

## Recommended 60-second composition

```text
00–04  HOOK-01
04–09  STAKES-01
09–15  TEAM-01 A
15–21  TEAM-01 B
21–27  PLAYER-01
27–34  TACT-01
34–42  TACT-02
42–47  TACT-03
47–53  DUEL-01
53–60  OUT-01
```

`DATA-01`, `FORM-01`, or `HIST-01` may replace a scene when the evidence is central to the explanation. The demo in `examples/` uses this composition and exposes the scene boundaries as a readable edit decision list.
