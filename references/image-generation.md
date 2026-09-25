# Image Asset Spec and prompt boundaries

Image generation is optional. It supplies atmosphere and silhouettes, not facts. Use a typed request before compiling a provider prompt:

```yaml
asset:
  type: SUB-PLAYER
  subject: Bukayo Saka
  pose: running
  orientation: facing-left
  treatment: editorial-cutout
```

Supported types are `ENV-STADIUM`, `ENV-CITY`, `ENV-HISTORY`, `SUB-PLAYER`, `SUB-COACH`, `SUB-TROPHY`, and `SUB-STADIUM`.

## Required negative prompt

Every compiled prompt includes:

```text
NO TEXT, NO NUMBERS, NO SCORE, NO DATE, NO LOGOS, NO CRESTS,
NO UI, NO INFOGRAPHIC, NO WATERMARK, NO GENERATED LABELS
```

Use accurate, licensed crests and provider-approved player references separately. Never ask an image model to draw a scoreline, xG, injury state, date, or tactical arrow. `compileAssetPrompt()` adds these constraints and reports the asset type so a failed request can fall back to a placeholder.

Do not commit generated or unlicensed media. Put local assets in `assets/environments/` or `assets/subjects/`; the repository ignores their contents by default.
