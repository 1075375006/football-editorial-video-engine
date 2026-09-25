---
name: football-editorial-video-engine
description: Build evidence-backed football preview videos with a reusable editorial visual system, deterministic SceneSpec planning, Remotion rendering, tactical graphics, and optional image assets. Use for football previews, explainers, match analysis videos, and requests to extend this FEE engine; do not use for generic football writing without a video or scene-planning deliverable.
metadata:
  short-description: "Plan and render editorial football preview videos"
---

# Football Editorial Video Engine

Use this skill as the director of a Football Editorial Explainer (FEE) production. The engine turns narration and verified evidence into a `SceneSpec` timeline, compiles optional environment/subject asset requests, and renders deterministic graphics with Remotion.

## Operating contract

1. Start from the user's narration, research, target duration, and aspect ratio. If evidence is supplied, preserve its provider, scope, period, and `asOf` timestamp.
2. Plan `SceneSpec` JSON before writing JSX. Select a narrative role (`HOOK`, `CONTEXT`, `EVIDENCE`, `EXPLANATION`, or `SYNTHESIS`) and one of the 14 patterns in [references/scene-library.md](references/scene-library.md).
3. Keep each scene's four layers explicit: L0 environment, L1 subject, L2 information, L3 annotation. Images may provide only L0/L1. Remotion must own typography, facts, data, maps, pitch geometry, arrows, labels, and motion.
4. Use only the motion preset whitelist in [references/motion-language.md](references/motion-language.md). Reveal quickly, hold long enough to read, and prefer a graphic wipe to a default dissolve.
5. Validate before rendering:

   ```bash
   npm install
   npm run validate
   npm test
   ```

6. Preview with `npm run studio`; render the offline demo with `npm run render:demo`. The demo uses no API key or private asset and is the smoke-test baseline.

## Hard visual and factual rules

- Use paper/cream, muted texture, strong asymmetry, heavy sans or condensed type, and one or two accents.
- Keep one main claim per screen. Data is evidence for a stated claim, not a dashboard.
- Do not put text, numbers, scorelines, dates, statistics, fake crests, or injury status into generated images. Use `scripts/compile-asset-prompt.ts` or `compileAssetPrompt()` to enforce the negative prompt.
- Do not add glassmorphism, HUD styling, gratuitous glow, universal spring physics, continuous floating, or a drop shadow to every element.
- Tactical scenes must be programmatic (`TacticalPitch`, zones, players, arrows, labels). Missing assets fall back to a labeled cutout placeholder so an offline render remains valid.
- Every evidence object needs a claim, period, source provider, and `asOf`. Keep xG at one decimal, counts as integers, and never mix competitions or time scopes.

## References to load by need

- Visual rules and layer ownership: [references/visual-grammar.md](references/visual-grammar.md) and [references/layering-system.md](references/layering-system.md).
- Pattern selection and 60-second composition: [references/scene-library.md](references/scene-library.md) and [references/story-structure.md](references/story-structure.md).
- Motion tokens and scene-to-scene transitions: [references/motion-language.md](references/motion-language.md).
- Image request boundaries: [references/image-generation.md](references/image-generation.md).
- Tactical geometry: [references/tactical-visualization.md](references/tactical-visualization.md).
- Evidence grammar and data accuracy: [references/data-visualization.md](references/data-visualization.md).

## Extending the engine

Add new patterns to `engine/src/types.ts`, `engine/src/schema.ts`, and `engine/src/scenes/SceneRenderer.tsx` together. Add a motion preset to the whitelist and tests before using it. Keep sample facts in `examples/` and keep credentials in environment variables. Do not commit generated video, private images, or API keys.

For a new project, clone this repository, run `npm install`, copy `examples/demo-scene-spec.json`, replace the facts and narration, run `npm run validate:scene -- path/to/file.json`, then render through the Remotion entry point described in the README.
