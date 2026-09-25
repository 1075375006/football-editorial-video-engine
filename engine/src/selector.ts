import type {NarrativeRole, ScenePattern, SceneSpec} from './types';

const patternsForIntent: Array<{pattern: ScenePattern; role: NarrativeRole; terms: string[]}> = [
  {pattern: 'HOOK-01', role: 'HOOK', terms: ['为什么要看', '决定', '关键一战', 'why watch']},
  {pattern: 'HOOK-02', role: 'HOOK', terms: ['为什么', '问题', '到底在哪里', 'question']},
  {pattern: 'CTX-01', role: 'CONTEXT', terms: ['在哪里', '球场', '城市', '日期', 'where']},
  {pattern: 'STAKES-01', role: 'EVIDENCE', terms: ['争冠', '争四', '保级', '晋级', '积分', 'title race']},
  {pattern: 'FORM-01', role: 'EVIDENCE', terms: ['最近五场', '近期状态', '过去五场', 'form', 'last five']},
  {pattern: 'PLAYER-01', role: 'EVIDENCE', terms: ['关键人物', '核心球员', '进球', '助攻', 'player']},
  {pattern: 'DUEL-01', role: 'EXPLANATION', terms: ['对位', '一对一', 'vs', 'battle']},
  {pattern: 'TACT-01', role: 'EXPLANATION', terms: ['阵型', '站在哪里', 'formation']},
  {pattern: 'TACT-02', role: 'EXPLANATION', terms: ['移动', '内收', '套边', '怎么动', 'move']},
  {pattern: 'TACT-03', role: 'EXPLANATION', terms: ['问题出现在', '空间', '暴露', '缺席之后', 'space']},
  {pattern: 'DATA-01', role: 'EVIDENCE', terms: ['xg', '数据', '效率', '百分比', '统计', 'stat']},
  {pattern: 'HIST-01', role: 'EVIDENCE', terms: ['历史', '交锋', '连续', 'h2h', 'record']},
  {pattern: 'OUT-01', role: 'SYNTHESIS', terms: ['最后', '应该看什么', '关注', 'watch']},
];

export const inferNarrativeRole = (narration: string): NarrativeRole => {
  const lower = narration.toLowerCase();
  const match = patternsForIntent.find((item) => item.terms.some((term) => lower.includes(term.toLowerCase())));
  return match?.role ?? 'EXPLANATION';
};

export const selectPattern = (narration: string): {pattern: ScenePattern; role: NarrativeRole} => {
  const lower = narration.toLowerCase();
  const candidates = patternsForIntent.flatMap((item) => item.terms.map((term) => ({item, term}))).sort((a, b) => b.term.length - a.term.length);
  const match = candidates.find(({term}) => lower.includes(term.toLowerCase()))?.item;
  return match ? {pattern: match.pattern, role: match.role} : {pattern: 'HOOK-02', role: 'HOOK'};
};

export interface SelectorInput {
  narration: string;
  targetDurationInFrames?: number;
  headline?: string;
  body?: string;
}

export const sceneFromNarration = (input: SelectorInput, startFrame = 0): SceneSpec => {
  const selected = selectPattern(input.narration);
  const durationByPattern: Partial<Record<ScenePattern, number>> = {
    'HOOK-01': 105,
    'HOOK-02': 120,
    'TACT-01': 180,
    'TACT-02': 210,
    'TACT-03': 150,
    'DUEL-01': 180,
    'OUT-01': 150,
  };
  return {
    id: `scene-${startFrame}`,
    pattern: selected.pattern,
    startFrame,
    durationInFrames: input.targetDurationInFrames ?? durationByPattern[selected.pattern] ?? 150,
    narration: input.narration,
    information: {headline: input.headline ?? input.narration, body: input.body},
    motionPreset: selected.pattern.startsWith('TACT') ? ['M07 tactical-build', 'M08 line-draw'] : ['M01 editorial-slam'],
  };
};
