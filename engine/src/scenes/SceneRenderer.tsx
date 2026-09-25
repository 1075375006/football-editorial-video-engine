import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {SceneSpec, TacticalKitPlayer, TacticalMove, TacticalZone} from '../types';
import {EditorialBackground} from '../components/EditorialBackground';
import {CutoutSubject} from '../components/CutoutSubject';
import {BigHeadline} from '../components/BigHeadline';
import {StatCard} from '../components/StatCard';
import {TacticalPitch} from '../components/TacticalPitch';
import {Map} from '../components/Map';
import {Annotation} from '../components/Annotation';
import {ComparisonBlock, DataSourceLabel, EvidenceNumber, H2HTimeline, TrendStrip, AvailabilityBoard} from '../components/DataPrimitives';
import {FEE_COLORS} from '../motion/tokens';

const TEAM_A = 'ARSENAL';
const TEAM_B = 'MANCHESTER CITY';

const players = [
  {id: 'a-gk', label: 'GK', x: 8, y: 50, team: 'A' as const, role: 'goalkeeper', buildOrder: 0},
  {id: 'a-rb', label: '2', x: 20, y: 15, team: 'A' as const, role: 'right back', buildOrder: 1},
  {id: 'a-rcb', label: '4', x: 20, y: 38, team: 'A' as const, buildOrder: 2},
  {id: 'a-lcb', label: '5', x: 20, y: 62, team: 'A' as const, buildOrder: 3},
  {id: 'a-lb', label: '3', x: 20, y: 85, team: 'A' as const, role: 'left back', buildOrder: 4},
  {id: 'a-6', label: '6', x: 36, y: 50, team: 'A' as const, role: 'anchor', buildOrder: 5},
  {id: 'a-8', label: '8', x: 43, y: 28, team: 'A' as const, buildOrder: 6},
  {id: 'a-10', label: '10', x: 43, y: 72, team: 'A' as const, buildOrder: 7},
  {id: 'a-11', label: '11', x: 63, y: 15, team: 'A' as const, buildOrder: 8},
  {id: 'a-9', label: '9', x: 73, y: 50, team: 'A' as const, buildOrder: 9},
  {id: 'a-7', label: '7', x: 63, y: 85, team: 'A' as const, role: 'inside', buildOrder: 10},
  {id: 'b-gk', label: 'GK', x: 92, y: 50, team: 'B' as const, role: 'goalkeeper', buildOrder: 11},
  {id: 'b-lb', label: '2', x: 80, y: 15, team: 'B' as const, buildOrder: 12},
  {id: 'b-lcb', label: '4', x: 80, y: 38, team: 'B' as const, buildOrder: 13},
  {id: 'b-rcb', label: '5', x: 80, y: 62, team: 'B' as const, buildOrder: 14},
  {id: 'b-rb', label: '3', x: 80, y: 85, team: 'B' as const, buildOrder: 15},
  {id: 'b-6', label: '6', x: 64, y: 50, team: 'B' as const, role: 'screen', buildOrder: 16},
  {id: 'b-8', label: '8', x: 57, y: 28, team: 'B' as const, buildOrder: 17},
  {id: 'b-10', label: '10', x: 57, y: 72, team: 'B' as const, buildOrder: 18},
  {id: 'b-7', label: '7', x: 37, y: 15, team: 'B' as const, buildOrder: 19},
  {id: 'b-9', label: '9', x: 27, y: 50, team: 'B' as const, buildOrder: 20},
  {id: 'b-11', label: '11', x: 37, y: 85, team: 'B' as const, buildOrder: 21},
];

const mechanismPlayers: TacticalKitPlayer[] = [
  {id: 'saka', label: '7', name: 'SAKA', position: {x: 0.78, y: 0.18}, team: 'A', role: 'inside run', emphasis: 'primary', buildOrder: 0},
  {id: 'white', label: '2', name: 'WHITE', position: {x: 0.88, y: 0.32}, team: 'A', role: 'overlap', emphasis: 'primary', buildOrder: 1},
  {id: 'rice', label: '6', name: 'RICE', position: {x: 0.60, y: 0.48}, team: 'A', role: 'cover', emphasis: 'secondary', buildOrder: 2},
  {id: 'gvardiol', label: '3', name: 'GVARDIOL', position: {x: 0.72, y: 0.42}, team: 'B', role: 'screen', emphasis: 'secondary', buildOrder: 3},
  {id: 'city-8', label: '8', position: {x: 0.60, y: 0.28}, team: 'B', role: 'midfield screen', emphasis: 'muted', buildOrder: 4},
];

const mechanismMoves: TacticalMove[] = [
  {id: 'saka-inside', playerId: 'saka', action: 'inside-run', from: {x: 0.78, y: 0.18}, to: {x: 0.66, y: 0.37}, startFrame: 18, durationInFrames: 18, showTrail: true, annotation: 'INSIDE'},
  {id: 'white-overlap', playerId: 'white', action: 'overlap', from: {x: 0.88, y: 0.32}, to: {x: 0.96, y: 0.12}, startFrame: 24, durationInFrames: 18, showTrail: true, annotation: 'OVERLAP'},
  {id: 'rice-cover', playerId: 'rice', action: 'cover', from: {x: 0.60, y: 0.48}, to: {x: 0.54, y: 0.44}, startFrame: 30, durationInFrames: 16, showTrail: true, annotation: 'COVER'},
];

const mechanismZones: TacticalZone[] = [
  {id: 'right-half-space', x: 0.57, y: 0.12, width: 0.22, height: 0.42, label: 'TARGET SPACE', tone: 'accent', opacity: 0.72, startFrame: 48, focus: true},
];

const SceneCanvas: React.FC<{scene: SceneSpec; children: React.ReactNode; tone?: 'paper' | 'dark' | 'field'}> = ({scene, children, tone = 'paper'}) => {
  const frame = useCurrentFrame();
  const showNarration = frame > 2 && frame < scene.durationInFrames - 2;
  return <EditorialBackground sceneStart={0} sceneDuration={scene.durationInFrames} tone={tone}><AbsoluteFill style={{position: 'relative'}}>{children}<div style={{position: 'absolute', right: 0, bottom: 0, width: 420, fontSize: 14, lineHeight: 1.3, color: tone === 'dark' ? 'rgba(255,255,255,.6)' : FEE_COLORS.muted, opacity: showNarration ? 0.75 : 0}}>{scene.narration}</div>{scene.evidence ? <DataSourceLabel provider={scene.evidence.source.provider} asOf={scene.evidence.source.asOf} /> : null}</AbsoluteFill></EditorialBackground>;
};

export const SceneRenderer: React.FC<{scene: SceneSpec}> = ({scene}) => {
  const frame = useCurrentFrame();
  const info = scene.information;
  switch (scene.pattern) {
    case 'HOOK-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 50, top: 30, fontSize: 18, letterSpacing: 4, color: FEE_COLORS.teamA}}>PREVIEW / PREMIER LEAGUE / 01</div><div style={{position: 'absolute', left: 80, top: 160}}><BigHeadline size={102} start={0}>{info.headline ?? `${TEAM_A} vs ${TEAM_B}`}</BigHeadline><div style={{marginTop: 30, fontSize: 30, maxWidth: 600}}>{info.body ?? 'The match that changes the title race.'}</div></div><CutoutSubject name="SAKA" team="A" side="left" sceneDuration={scene.durationInFrames} revealStart={8} /><CutoutSubject name="HAALAND" team="B" side="right" sceneDuration={scene.durationInFrames} revealStart={14} /></SceneCanvas>;
    case 'HOOK-02':
      return <SceneCanvas scene={scene} tone="dark"><div style={{position: 'absolute', left: 80, top: 170, color: FEE_COLORS.white}}><BigHeadline color={FEE_COLORS.white} size={96} start={0}>{info.headline ?? 'WHERE DOES THE SPACE APPEAR?'}</BigHeadline><div style={{fontSize: 28, marginTop: 30, color: FEE_COLORS.accent}}>A match question, made visible.</div></div><Annotation type="circle" from={[75, 28]} to={[75, 28]} label="?" start={18} color={FEE_COLORS.accent} /></SceneCanvas>;
    case 'CTX-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 52, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 5, color: FEE_COLORS.teamA}}>LONDON / EMIRATES STADIUM</div><BigHeadline size={86} start={4}>{info.headline ?? 'A TITLE RACE IN NORTH LONDON'}</BigHeadline></div><Map place="EMIRATES" start={12} /></SceneCanvas>;
    case 'STAKES-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 70}}><div style={{fontSize: 22, color: FEE_COLORS.muted, letterSpacing: 4}}>WHY THIS MATCH MATTERS</div><BigHeadline size={94} start={0}>{info.headline ?? 'ONE POINT. ONE TABLE.'}</BigHeadline></div><div style={{position: 'absolute', left: 100, right: 100, top: 390, display: 'flex', justifyContent: 'space-between', alignItems: 'end'}}><StatCard label="ARSENAL" value={info.stats?.arsenal ?? '70'} detail="points" tone="A" start={12} /><div style={{height: 4, flex: 1, margin: '0 42px 48px', background: FEE_COLORS.accent}} /><StatCard label="CITY" value={info.stats?.city ?? '69'} detail="points" tone="B" start={18} /></div></SceneCanvas>;
    case 'TEAM-01':
      {
        const isCity = String(info.stats?.team ?? '').toUpperCase().includes('CITY');
        return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 70, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4, color: isCity ? FEE_COLORS.teamB : FEE_COLORS.teamA}}>{info.stats?.team ?? TEAM_A}</div><BigHeadline size={76} start={0}>{info.headline ?? 'FORM WITH A WARNING'}</BigHeadline><div style={{fontSize: 25, maxWidth: 680, marginTop: 24}}>{info.body ?? 'Five unbeaten, but the final third is slowing down.'}</div></div><CutoutSubject name={isCity ? '9' : '7'} team={isCity ? 'B' : 'A'} side="right" sceneDuration={scene.durationInFrames} revealStart={10} /></SceneCanvas>;
      }
    case 'FORM-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 80}}><div style={{fontSize: 22, letterSpacing: 4, color: FEE_COLORS.muted}}>FORM STRIP</div><BigHeadline size={82} start={0}>{info.headline ?? 'FIVE MATCHES. ONE TREND.'}</BigHeadline></div><TrendStrip start={10} items={[{opponent: 'FUL', result: 'W', score: '3–1'}, {opponent: 'CHE', result: 'W', score: '2–0'}, {opponent: 'LIV', result: 'D', score: '1–1', tone: 'draw'}, {opponent: 'NEW', result: 'L', score: '0–2', tone: 'loss'}, {opponent: 'WHU', result: 'W', score: '4–1'}]} /></SceneCanvas>;
    case 'PLAYER-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 70, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4, color: FEE_COLORS.teamA}}>KEY PLAYER / 07</div><BigHeadline size={96} start={0}>{info.headline ?? 'SAKA'}</BigHeadline><div style={{display: 'flex', gap: 50, marginTop: 48}}><StatCard label="GOALS" value={info.stats?.goals ?? 12} tone="A" start={12} /><StatCard label="ASSISTS" value={info.stats?.assists ?? 8} tone="accent" start={18} /></div></div><CutoutSubject name="SAKA" team="A" side="right" sceneDuration={scene.durationInFrames} revealStart={8} /></SceneCanvas>;
    case 'DUEL-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 70, right: 80, display: 'flex', justifyContent: 'space-between', zIndex: 4}}><div style={{fontSize: 22, color: FEE_COLORS.teamA, letterSpacing: 4}}>KEY BATTLE</div><div style={{fontSize: 22, color: FEE_COLORS.teamB, letterSpacing: 4}}>RIGHT HALF-SPACE</div></div><CutoutSubject name="SAKA" team="A" side="left" sceneDuration={scene.durationInFrames} revealStart={5} /><CutoutSubject name="GVARDIOL" team="B" side="right" sceneDuration={scene.durationInFrames} revealStart={12} /><div style={{position: 'absolute', left: '50%', top: '44%', translate: '-50% -50%', zIndex: 7, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 100, color: FEE_COLORS.accent}}>VS</div><Annotation type="arrow" from={[32, 46]} to={[68, 40]} label="space" start={28} /></SceneCanvas>;
    case 'TACT-01':
      return <SceneCanvas scene={scene} tone="field"><div style={{position: 'absolute', left: 70, top: 42, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4}}>FORMATION BOARD</div><BigHeadline color={FEE_COLORS.white} size={82} start={0}>{info.headline ?? '4–3–3 SHAPE'}</BigHeadline></div><TacticalPitch players={scene.tactical?.players ?? players} movements={scene.tactical?.movements} zones={scene.tactical?.zones} arrows={scene.tactical?.arrows} annotations={scene.tactical?.annotations} perspective={scene.tactical?.perspective ?? 'top'} theme={scene.tactical?.theme ?? 'editorial-green'} attackDirection={scene.tactical?.attackDirection ?? 'left-to-right'} crop={scene.tactical?.crop} focusPlayerIds={scene.tactical?.focusPlayerIds} focusZoneId={scene.tactical?.focusZoneId} muted={scene.tactical?.muted} start={8} frameOffset={scene.startFrame} /></SceneCanvas>;
    case 'TACT-02':
      return <SceneCanvas scene={scene} tone="field"><div style={{position: 'absolute', left: 70, top: 42, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4}}>TACTICAL MECHANISM</div><BigHeadline color={FEE_COLORS.white} size={70} start={0}>{info.headline ?? 'WHEN 7 MOVES INSIDE'}</BigHeadline></div><TacticalPitch players={scene.tactical?.players ?? mechanismPlayers} movements={scene.tactical?.movements ?? mechanismMoves} zones={scene.tactical?.zones ?? mechanismZones} arrows={scene.tactical?.arrows ?? [{id: 'mechanism-arrow', from: {x: 0.78, y: 0.18}, to: {x: 0.66, y: 0.37}, label: 'IN', startFrame: 42}, {id: 'overlap-arrow', from: {x: 0.88, y: 0.32}, to: {x: 0.96, y: 0.12}, label: 'OVER', startFrame: 46}]} annotations={scene.tactical?.annotations} perspective={scene.tactical?.perspective ?? 'top'} theme={scene.tactical?.theme ?? 'editorial-green'} attackDirection={scene.tactical?.attackDirection ?? 'left-to-right'} crop={scene.tactical?.crop} focusPlayerIds={scene.tactical?.focusPlayerIds} focusZoneId={scene.tactical?.focusZoneId} muted={scene.tactical?.muted} showPlayerLabels start={8} frameOffset={scene.startFrame} /></SceneCanvas>;
    case 'TACT-03':
      return <SceneCanvas scene={scene} tone="field"><div style={{position: 'absolute', left: 70, top: 42, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4}}>SPACE REVEAL</div><BigHeadline color={FEE_COLORS.white} size={88} start={0}>{info.headline ?? 'THE SPACE IS HERE'}</BigHeadline></div><TacticalPitch players={scene.tactical?.players ?? mechanismPlayers} movements={scene.tactical?.movements ?? mechanismMoves} zones={scene.tactical?.zones ?? [{id: 'exposed', x: 0.42, y: 0.14, width: 0.22, height: 0.36, label: 'SPACE', tone: 'warning', focus: true, startFrame: 44}]} arrows={scene.tactical?.arrows ?? [{id: 'expose', from: {x: 0.73, y: 0.47}, to: {x: 0.53, y: 0.31}, label: 'PROTECT', tone: 'warning', startFrame: 56}]} annotations={scene.tactical?.annotations} perspective={scene.tactical?.perspective ?? 'detail'} theme={scene.tactical?.theme ?? 'mono-focus'} attackDirection={scene.tactical?.attackDirection ?? 'left-to-right'} crop={scene.tactical?.crop} focusPlayerIds={scene.tactical?.focusPlayerIds ?? ['saka', 'rice', 'gvardiol']} focusZoneId={scene.tactical?.focusZoneId ?? 'exposed'} muted={scene.tactical?.muted} showPlayerLabels start={8} frameOffset={scene.startFrame} /></SceneCanvas>;
    case 'DATA-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 70}}><div style={{fontSize: 22, letterSpacing: 4, color: FEE_COLORS.muted}}>ONE DATA POINT</div><BigHeadline size={76} start={0}>{info.headline ?? 'WHO CREATES THE BETTER CHANCES?'}</BigHeadline></div>{info.stats?.mode === 'delta' ? <EvidenceNumber claim="MANCHESTER CITY UNDERPERFORMS ITS CHANCES" value={info.stats?.delta ?? '-3.4'} unit="GOALS" period="Premier League · Last 8 matches" source={scene.evidence?.source.provider ?? 'offline fixture'} start={12} /> : <ComparisonBlock left={{label: TEAM_A, value: info.stats?.arsenalXg ?? '2.1'}} right={{label: 'CITY', value: info.stats?.cityXg ?? '1.4'}} delta={info.stats?.difference ? `+${info.stats.difference}` : '+0.7'} start={12} />}</SceneCanvas>;
    case 'HIST-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 70}}><div style={{fontSize: 22, letterSpacing: 4, color: FEE_COLORS.muted}}>HISTORY / H2H</div><BigHeadline size={78} start={0}>{info.headline ?? 'THE LAST FIVE'}</BigHeadline></div><H2HTimeline start={10} items={[{year: '2022', result: 'CITY WIN'}, {year: '2023', result: 'DRAW'}, {year: '2024', result: 'CITY WIN'}, {year: '2025', result: 'A WIN'}, {year: '2026', result: 'CITY WIN'}]} /></SceneCanvas>;
    case 'OUT-01':
      return <SceneCanvas scene={scene}><div style={{position: 'absolute', left: 80, top: 60}}><div style={{fontSize: 22, letterSpacing: 4, color: FEE_COLORS.teamA}}>WATCH</div><BigHeadline size={86} start={0}>{info.headline ?? 'THREE THINGS TO WATCH'}</BigHeadline></div><div style={{position: 'absolute', left: 100, top: 330, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 40, lineHeight: 1.45}}><div><span style={{color: FEE_COLORS.teamA}}>01</span> Arsenal left side</div><div><span style={{color: FEE_COLORS.teamB}}>02</span> City midfield screen</div><div><span style={{color: FEE_COLORS.accent}}>03</span> The first transition</div></div><div style={{position: 'absolute', right: 80, bottom: 50, borderTop: `4px solid ${FEE_COLORS.ink}`, paddingTop: 12, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 30, textAlign: 'right'}}>ARSENAL<br /><span style={{color: FEE_COLORS.teamA}}>VS</span><br />MANCHESTER CITY</div></SceneCanvas>;
    default:
      return <SceneCanvas scene={scene}><BigHeadline>{info.headline ?? 'FEE SCENE'}</BigHeadline></SceneCanvas>;
  }
};
