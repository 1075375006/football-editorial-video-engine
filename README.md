# Football Editorial Video Engine

Football Editorial Explainer (FEE) is a reusable Codex Skill plus a small Remotion engine for evidence-backed football preview videos. It treats the Skill as the director, `SceneSpec` as the edit decision list, Remotion as the deterministic graphics studio, and optional image generation as an environment/subject asset service.

## What is included

- A discoverable `SKILL.md` that can be installed from this repository.
- A 14-pattern scene library, nine motion presets, four-layer visual grammar, and evidence rules in `references/`.
- TypeScript contracts and validation for `SceneSpec` and `EvidenceSpec`.
- A deterministic tactical pitch, annotations, editorial data primitives, and scene renderer.
- A reusable Tactical Pitch Kit with normalized coordinates, top/isometric/detail views, three themes, attack-direction mirroring, named player movements, trails, zones, arrows, and focus reveals.
- A 60-second, 30fps, 1920×1080 offline demo with no API key and no private media.

## Run locally

Requires Node.js 20+, npm, and a Remotion-compatible Chromium installation.

```bash
npm install
npm run validate
npm test
npm run studio
# in another terminal, when you want a file:
npm run render:demo
# tactical mechanism still (frame 1100)
npm run render:tactical-still
```

The rendered file is `out/fee-demo.mp4`. To validate another SceneSpec:

```bash
npm run validate:scene -- path/to/scene-spec.json
```

The tactical fixture is ready to validate and render as part of the same contract:

```bash
npx tsx scripts/validate-scene-spec.ts examples/tactical-pitch-kit.json
```

Tactical data uses normalized `0..1` points. A scene can describe a named movement instead of hand-writing animation:

```ts
{
  id: 'saka-inside', playerId: 'saka', action: 'inside-run',
  from: {x: 0.78, y: 0.18}, to: {x: 0.66, y: 0.37},
  startFrame: 18, durationInFrames: 18, showTrail: true
}
```

The renderer keeps the pitch, markers, labels, arrows, and facts programmatic. See [`references/tactical-visualization.md`](references/tactical-visualization.md) for the coordinate and timing contract.

To compile an image request while keeping facts out of the image prompt:

```bash
echo '{"type":"SUB-PLAYER","subject":"Bukayo Saka","pose":"running","orientation":"facing-left","treatment":"editorial-cutout"}' | npm run compile:asset
```

## Install the Skill in Codex

From a checked-out copy, point Codex at the repository root because it contains `SKILL.md`. For the GitHub installer, use:

```bash
python <CODEX_HOME>/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo 1075375006/football-editorial-video-engine
```

The exact installer command can vary by Codex distribution; the important requirement is that the selected path contains the root `SKILL.md`. The engine remains available to the Skill through the same checkout.

## Project layout

```text
SKILL.md                 Codex entrypoint
references/              FEE rules and scene/data contracts
engine/src/              Remotion components, patterns, motion, selector
examples/                Offline demo SceneSpec and fixtures
scripts/                 Validation and prompt/selector CLIs
assets/                  Optional user-owned environments and subjects
```

Generated images, match data, fonts, and video exports are intentionally not committed. Use environment variables for provider keys and record a source plus `asOf` timestamp for every evidence object. See `references/image-generation.md` and `references/data-visualization.md` before adding live data.

## GitHub publishing

The repository is designed to be public and self-contained. Before pushing a fork, review asset licenses, add a remote, and keep secrets out of Git. A normal release flow is:

```bash
git init
git branch -M main
git add -A
git commit -m "Build Football Editorial Video Engine v0.1"
git remote add origin https://github.com/1075375006/football-editorial-video-engine.git
git push -u origin main
```

If that remote has not been created yet, create an empty public repository named `football-editorial-video-engine` in GitHub first, or choose another owner/repository and update the command.
