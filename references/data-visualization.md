# Data and evidence grammar v0.1

Data is an evidence object in an editorial composition, not a dashboard. Title the conclusion first and let one number or comparison prove it. A data scene keeps L0–L3 ownership even when L1 is empty.

## EvidenceSpec

```ts
type EvidenceSpec = {
  motif: 'contrast' | 'trend-strip' | 'delta' | 'availability' | 'history-timeline' | 'spatial-impact';
  claim: string;
  metric?: { key: string; label: string; unit?: string; format: 'integer' | 'decimal-1' | 'percent' | 'text' };
  subjects?: string[];
  values?: Record<string, number | string>;
  period: { label: string; from?: string; to?: string };
  scope?: { competition?: string; venue?: 'home' | 'away' | 'all'; sampleSize?: number; denominator?: string };
  source: { provider: string; asOf: string };
  emphasis?: string;
};
```

## Motifs

- `contrast`: two teams and one delta, such as xG/90.
- `trend-strip`: recent results or goal/conceded rhythm.
- `delta`: actual goals against xG or xGA.
- `availability`: only the 2–4 absences that change the match, with visible status text.
- `history-timeline`: a recent, scoped H2H sample plus one conclusion.
- `spatial-impact`: availability or data leading into a highlighted tactical zone.

Hard rules: xG normally has one decimal; counts are integers; percentages include the comparison range; every object has a period and source/asOf; do not mix league, cup, and European samples. Source text may be small but cannot disappear. If an injury status is unknown or stale, show `UNKNOWN` or `CHECK` and do not infer it.

For a 3–5 second data scene, introduce metric/scope at 0–6f, punch the main number at 6–16f, add the comparison at 12–24f, draw the delta at 20–32f, then hold. Use at most two or three motion presets.
