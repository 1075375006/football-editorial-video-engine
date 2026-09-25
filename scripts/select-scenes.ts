import {sceneFromNarration} from '../engine/src/selector';

const narration = process.argv.slice(2).join(' ') || '为什么这场比赛决定争冠格局？';
console.log(JSON.stringify(sceneFromNarration({narration}), null, 2));
