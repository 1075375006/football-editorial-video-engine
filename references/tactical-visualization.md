# Tactical visualization

`TacticalPitch` is a deterministic SVG/HTML second stage. It accepts normalized coordinates (`x` and `y` from 0 to 100), a team, an optional label, and an optional state. The component draws the field, players, zones, and arrows without an image model.

```tsx
<TacticalPitch
  players={[{id: 'saka', label: '7', x: 78, y: 38, team: 'A'}]}
  zones={[{id: 'half-space', x: 62, y: 24, width: 22, height: 40, label: 'SPACE'}]}
  arrows={[{from: [78, 38], to: [64, 24], label: 'inside'}]}
/>
```

`TACT-01` reveals players in order. `TACT-02` holds players, then draws the movement arrow. `TACT-03` desaturates the pitch, highlights one zone, and labels the exposed space. A tactical claim should name the action and the space it changes.

Keep labels short, keep the pitch readable at mobile width, and avoid a full team sheet unless the narration needs it. The demo uses normalized coordinates so the same scene can be cropped to a vertical composition later.
