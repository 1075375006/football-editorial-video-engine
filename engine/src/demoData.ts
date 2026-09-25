import type {SceneDocument} from './types';

export const demoSceneDocument: SceneDocument = {
  schemaVersion: '0.1',
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [
    {id: 'hook', pattern: 'HOOK-01', startFrame: 0, durationInFrames: 120, narration: 'This match could decide the title race.', information: {headline: 'ARSENAL VS MANCHESTER CITY', body: 'A match that changes the table.'}, motionPreset: ['M01 editorial-slam', 'M02 cutout-reveal']},
    {id: 'stakes', pattern: 'STAKES-01', startFrame: 120, durationInFrames: 150, narration: 'One point separates the two teams.', information: {headline: 'ONE POINT. ONE TABLE.', stats: {arsenal: 70, city: 69}}, motionPreset: ['M01 editorial-slam', 'M06 number-punch']},
    {id: 'team-a', pattern: 'TEAM-01', startFrame: 270, durationInFrames: 180, narration: 'Arsenal are unbeaten in five, but the final third is slowing down.', information: {headline: 'FORM WITH A WARNING', body: 'Five unbeaten, but the final third is slowing down.', stats: {team: 'ARSENAL'}}, motionPreset: ['M02 cutout-reveal', 'M03 stagger-stack']},
    {id: 'team-b', pattern: 'TEAM-01', startFrame: 450, durationInFrames: 180, narration: 'City still create chances, but their conversion has slipped.', information: {headline: 'CONTROL WITHOUT THE FINISH', body: 'The shape is familiar. The margin is not.', stats: {team: 'CITY'}}, motionPreset: ['M02 cutout-reveal', 'M03 stagger-stack']},
    {id: 'player', pattern: 'PLAYER-01', startFrame: 630, durationInFrames: 180, narration: 'Saka is the player who changes Arsenal’s right side.', information: {headline: 'SAKA', stats: {goals: 12, assists: 8}}, motionPreset: ['M02 cutout-reveal', 'M06 number-punch']},
    {id: 'formation', pattern: 'TACT-01', startFrame: 810, durationInFrames: 210, narration: 'Both teams begin in a 4-3-3 shape.', information: {headline: '4–3–3 SHAPE'}, motionPreset: ['M07 tactical-build']},
    {
      id: 'mechanism',
      pattern: 'TACT-02',
      startFrame: 1020,
      durationInFrames: 240,
      narration: 'When Saka moves inside, the fullback can overlap outside him.',
      information: {headline: 'WHEN 7 MOVES INSIDE'},
      motionPreset: ['M07 tactical-build', 'M08 line-draw'],
      tactical: {
        perspective: 'top',
        theme: 'editorial-green',
        attackDirection: 'left-to-right',
        players: [
          {id: 'saka', label: '7', name: 'SAKA', position: {x: 0.78, y: 0.18}, team: 'A', role: 'inside run', emphasis: 'primary', buildOrder: 0},
          {id: 'white', label: '2', name: 'WHITE', position: {x: 0.88, y: 0.32}, team: 'A', role: 'overlap', emphasis: 'primary', buildOrder: 1},
          {id: 'rice', label: '6', name: 'RICE', position: {x: 0.6, y: 0.48}, team: 'A', role: 'cover', emphasis: 'secondary', buildOrder: 2},
          {id: 'gvardiol', label: '3', name: 'GVARDIOL', position: {x: 0.72, y: 0.42}, team: 'B', role: 'screen', emphasis: 'secondary', buildOrder: 3},
          {id: 'city-8', label: '8', position: {x: 0.6, y: 0.28}, team: 'B', role: 'midfield screen', emphasis: 'muted', buildOrder: 4}
        ],
        movements: [
          {id: 'saka-inside', playerId: 'saka', action: 'inside-run', from: {x: 0.78, y: 0.18}, to: {x: 0.66, y: 0.37}, startFrame: 18, durationInFrames: 18, showTrail: true, annotation: 'INSIDE'},
          {id: 'white-overlap', playerId: 'white', action: 'overlap', from: {x: 0.88, y: 0.32}, to: {x: 0.96, y: 0.12}, startFrame: 24, durationInFrames: 18, showTrail: true, annotation: 'OVERLAP'},
          {id: 'rice-cover', playerId: 'rice', action: 'cover', from: {x: 0.6, y: 0.48}, to: {x: 0.54, y: 0.44}, startFrame: 30, durationInFrames: 16, showTrail: true, annotation: 'COVER'}
        ],
        zones: [{id: 'right-half-space', rect: {x: 0.57, y: 0.12, width: 0.22, height: 0.42}, label: 'TARGET SPACE', tone: 'accent', opacity: 0.72, startFrame: 48, focus: true}],
        arrows: [
          {id: 'mechanism-arrow', from: {x: 0.78, y: 0.18}, to: {x: 0.66, y: 0.37}, label: 'IN', startFrame: 42},
          {id: 'overlap-arrow', from: {x: 0.88, y: 0.32}, to: {x: 0.96, y: 0.12}, label: 'OVER', startFrame: 46}
        ]
      }
    },
    {
      id: 'space',
      pattern: 'TACT-03',
      startFrame: 1260,
      durationInFrames: 150,
      narration: 'That rotation exposes the half-space behind the first screen.',
      information: {headline: 'THE SPACE IS HERE'},
      motionPreset: ['M05 focus-push', 'M08 line-draw'],
      tactical: {
        perspective: 'detail',
        theme: 'mono-focus',
        attackDirection: 'left-to-right',
        crop: {x: 0.38, y: 0.08, width: 0.58, height: 0.84},
        players: [
          {id: 'saka', label: '7', name: 'SAKA', position: {x: 0.66, y: 0.37}, team: 'A', role: 'inside run', emphasis: 'primary', buildOrder: 0},
          {id: 'white', label: '2', name: 'WHITE', position: {x: 0.96, y: 0.12}, team: 'A', role: 'overlap', emphasis: 'secondary', buildOrder: 1},
          {id: 'rice', label: '6', name: 'RICE', position: {x: 0.54, y: 0.44}, team: 'A', role: 'cover', emphasis: 'secondary', buildOrder: 2},
          {id: 'gvardiol', label: '3', name: 'GVARDIOL', position: {x: 0.72, y: 0.42}, team: 'B', role: 'screen', emphasis: 'secondary', buildOrder: 3},
          {id: 'city-8', label: '8', position: {x: 0.6, y: 0.28}, team: 'B', role: 'midfield screen', emphasis: 'muted', buildOrder: 4}
        ],
        zones: [{id: 'exposed', rect: {x: 0.42, y: 0.14, width: 0.22, height: 0.36}, label: 'SPACE', tone: 'warning', focus: true, startFrame: 44}],
        arrows: [{id: 'expose', from: {x: 0.73, y: 0.47}, to: {x: 0.53, y: 0.31}, label: 'PROTECT', tone: 'warning', startFrame: 56}],
        focusPlayerIds: ['saka', 'rice', 'gvardiol'],
        focusZoneId: 'exposed'
      }
    },
    {id: 'duel', pattern: 'DUEL-01', startFrame: 1410, durationInFrames: 180, narration: 'The key battle is Saka against Gvardiol on that side.', information: {headline: 'SAKA VS GVARDIOL'}, motionPreset: ['M02 cutout-reveal', 'M06 number-punch', 'M08 line-draw']},
    {id: 'out', pattern: 'OUT-01', startFrame: 1590, durationInFrames: 210, narration: 'Watch Arsenal’s left side, City’s midfield screen, and the first transition.', information: {headline: 'THREE THINGS TO WATCH'}, motionPreset: ['M03 stagger-stack', 'M01 editorial-slam']},
  ],
};
