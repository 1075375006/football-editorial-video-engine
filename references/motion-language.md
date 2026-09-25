# Motion Language v0.1

All motion is driven by `useCurrentFrame()` and the preset whitelist. At 30fps, a reveal normally lasts 10–18 frames and the remainder is a stable hold.

| ID | Preset | Contract |
| --- | --- | --- |
| `M01` | `editorial-slam` | scale 0.92→1, rise 20→0, opacity 0→1 in 10–14f |
| `M02` | `cutout-reveal` | edge/mask reveal with a 12–18f settle |
| `M03` | `stagger-stack` | items enter 5–9f apart, then hold |
| `M04` | `graphic-wipe` | paper or color block covers a cut in 8–12f |
| `M05` | `focus-push` | local emphasis over 18–30f; never a continuous camera drift |
| `M06` | `number-punch` | number appears quickly and stops; no long odometer |
| `M07` | `tactical-build` | players → zone → arrows over 30–60f |
| `M08` | `line-draw` | circles, arrows, and connectors draw in 12–24f |
| `M09` | `parallax-drift` | environment x 0→−12, subject 0→−25; L2/L3 stay still |

## Transition contract

The outgoing scene holds its information until the incoming scene has a visible anchor. A wipe may cover the old environment, but it must not erase a number before its hold window. Do not add an unregistered spring or a second camera move to solve a timing problem. A scene may be static.

The implementation lives in `engine/src/motion/`. Tokens are measured in frames and can be scaled by a composition FPS; the reference timings assume 30fps.
