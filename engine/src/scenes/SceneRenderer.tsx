import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {SceneSpec} from '../types';
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
  {id: 'a-gk', label: 'GK', x: 8, y: 31, team: 'A' as const, role: 'back line'},
  {id: 'a-6', label: '6', x: 27, y: 31, team: 'A' as const, role: 'anchor'},
  {id: 'a-8', label: '8', x: 39, y: 17, team: 'A' as const},
  {id: 'a-10', label: '10', x: 45, y: 44, team: 'A' as const},
  {id: 'a-7', label: '7', x: 65, y: 18, team: 'A' as const, role: 'inside'},
  {id: 'a-9', label: '9', x: 78, y: 32, team: 'A' as const},
  {id: 'b-gk', label: 'GK', x: 92, y: 31, team: 'B' as const, role: 'back line'},
  {id: 'b-6', label: '6', x: 73, y: 48, team: 'B' as const, role: 'screen'},
  {id: 'b-8', label: '8', x: 60, y: 50, team: 'B' as const},
  {id: 'b-10', label: '10', x: 53, y: 26, team: 'B' as const},
  {id: 'b-7', label: '7', x: 35, y: 50, team: 'B' as const},
  {id: 'b-9', label: '9', x: 22, y: 31, team: 'B' as const},
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
      return <SceneCanvas scene={scene} tone="field"><div style={{position: 'absolute', left: 70, top: 42, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4}}>FORMATION BOARD</div><BigHeadline color={FEE_COLORS.white} size={82} start={0}>{info.headline ?? '4–3–3 SHAPE'}</BigHeadline></div><TacticalPitch players={players} start={8} /></SceneCanvas>;
    case 'TACT-02':
      return <SceneCanvas scene={scene} tone="field"><div style={{position: 'absolute', left: 70, top: 42, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4}}>TACTICAL MECHANISM</div><BigHeadline color={FEE_COLORS.white} size={70} start={0}>{info.headline ?? 'WHEN 7 MOVES INSIDE'}</BigHeadline></div><TacticalPitch players={players} zones={[{id: 'right-half-space', x: 55, y: 12, width: 25, height: 38, label: 'SPACE', tone: 'accent'}]} arrows={[{id: 'saka-inside', from: [65, 18], to: [58, 32], label: 'in'}, {id: 'white-overlap', from: [78, 32], to: [87, 20], label: 'over'}]} start={8} /></SceneCanvas>;
    case 'TACT-03':
      return <SceneCanvas scene={scene} tone="field"><div style={{position: 'absolute', left: 70, top: 42, zIndex: 4}}><div style={{fontSize: 22, letterSpacing: 4}}>SPACE REVEAL</div><BigHeadline color={FEE_COLORS.white} size={88} start={0}>{info.headline ?? 'THE SPACE IS HERE'}</BigHeadline></div><TacticalPitch players={players} muted zones={[{id: 'exposed', x: 42, y: 14, width: 22, height: 36, label: 'SPACE', tone: 'warning'}]} arrows={[{id: 'expose', from: [73, 47], to: [53, 31], label: 'protect'}]} start={8} /></SceneCanvas>;
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
