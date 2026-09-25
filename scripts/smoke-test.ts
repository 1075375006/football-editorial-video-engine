import assert from 'node:assert/strict';
import {compileAssetPrompt} from '../engine/src/assetPlanner';
import {validateSceneDocument, validateScene} from '../engine/src/schema';
import {selectPattern, sceneFromNarration} from '../engine/src/selector';
import {demoSceneDocument} from '../engine/src/demoData';

const valid = validateSceneDocument(demoSceneDocument);
assert.equal(valid.valid, true, valid.errors.join('\n'));
assert.equal(selectPattern('过去五场状态如何？').pattern, 'FORM-01');
assert.equal(selectPattern('问题出现在这个空间').pattern, 'TACT-03');
assert.equal(sceneFromNarration({narration: '关键对位是谁？'}).pattern, 'DUEL-01');
assert.ok(compileAssetPrompt({type: 'SUB-PLAYER', subject: 'Bukayo Saka'}).includes('NO TEXT'));
assert.ok(validateScene({...demoSceneDocument.scenes[0], motionPreset: ['not-a-preset']} as unknown).length > 0);
console.log('Smoke tests passed: schema, selector, and asset prompt invariants.');
