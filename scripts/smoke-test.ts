import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {compileAssetPrompt} from '../engine/src/assetPlanner';
import {buildImageGenerationRequest, generateAsset, loadImageProviderConfig} from '../engine/src/assets/provider';
import {validateSceneDocument, validateScene} from '../engine/src/schema';
import {selectPattern, sceneFromNarration} from '../engine/src/selector';
import {demoSceneDocument} from '../engine/src/demoData';
import {mapPointToCrop, orientPoint} from '../engine/src/tactical/geometry';
import {positionForPlayer} from '../engine/src/tactical/motion';

const valid = validateSceneDocument(demoSceneDocument);
assert.equal(valid.valid, true, valid.errors.join('\n'));
assert.equal(selectPattern('过去五场状态如何？').pattern, 'FORM-01');
assert.equal(selectPattern('问题出现在这个空间').pattern, 'TACT-03');
assert.equal(sceneFromNarration({narration: '关键对位是谁？'}).pattern, 'DUEL-01');
assert.ok(compileAssetPrompt({type: 'SUB-PLAYER', subject: 'Bukayo Saka'}).includes('NO TEXT'));
assert.ok(validateScene({...demoSceneDocument.scenes[0], motionPreset: ['not-a-preset']} as unknown).length > 0);
assert.deepEqual(orientPoint({x: 0.2, y: 0.4}, 'right-to-left'), {x: 0.8, y: 0.4});
assert.deepEqual(mapPointToCrop({x: 0.75, y: 0.5}, {x: 0.5, y: 0, width: 0.5, height: 1}, 'left-to-right'), {x: 0.5, y: 0.5});
assert.deepEqual(mapPointToCrop({x: 0.75, y: 0.5}, {x: 0.5, y: 0, width: 0.5, height: 1}, 'right-to-left'), {x: 0.5, y: 0.5});
const movementState = positionForPlayer(27, {id: 'saka', label: '7', position: {x: 0.8, y: 0.2}, team: 'A'}, [{id: 'move', playerId: 'saka', action: 'inside-run', from: {x: 0.8, y: 0.2}, to: {x: 0.6, y: 0.4}, startFrame: 18, durationInFrames: 18}]);
assert.ok(movementState.point.x < 0.8 && movementState.point.x > 0.6);
assert.equal(validateScene({...demoSceneDocument.scenes[6], tactical: {theme: 'mono-focus', players: [], movements: [{id: 'bad', playerId: 'missing', action: 'teleport', from: {x: 0, y: 0}, to: {x: 1, y: 1}, startFrame: 0, durationInFrames: 10}]}} as unknown).some((error) => error.includes('action is invalid')), true);
const providerRoot = await mkdtemp(path.join(os.tmpdir(), 'fee-provider-'));
const providerRequest = buildImageGenerationRequest({type: 'SUB-PLAYER', subject: 'Test Player'}, {assetId: 'provider-smoke', width: 256, height: 256});
const providerConfig = loadImageProviderConfig({FEE_IMAGE_PROVIDER: 'openai-compatible', FEE_IMAGE_API_KEY: 'test-key', FEE_IMAGE_RELAY_URL: 'https://relay.example/v1', FEE_IMAGE_MODEL: 'test-model'}, {workspaceRoot: providerRoot, outputRoot: providerRoot, fetchImpl: async (url, init) => {
  assert.equal(String(url), 'https://relay.example/v1/images/generations');
  const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
  assert.equal(body.model, 'test-model');
  return new Response(JSON.stringify({id: 'mock-generation', data: [{b64_json: Buffer.from('fixture-image').toString('base64')}]}), {status: 200, headers: {'content-type': 'application/json'}});
}});
const providerResult = await generateAsset(providerRequest, providerConfig);
assert.equal(providerResult.status, 'ok');
assert.equal(providerResult.artifacts.length, 1);
await rm(providerRoot, {recursive: true, force: true});
const leonardoRoot = await mkdtemp(path.join(os.tmpdir(), 'fee-leonardo-'));
let leonardoCalls = 0;
const leonardoConfig = loadImageProviderConfig({FEE_IMAGE_PROVIDER: 'leonardo', LEONARDO_API_KEY: 'test-key', LEONARDO_API_BASE_URL: 'https://cloud.leonardo.ai/api/rest/v1', LEONARDO_MODEL_ID: 'model-id'}, {workspaceRoot: leonardoRoot, outputRoot: leonardoRoot, pollIntervalMs: 250, pollTimeoutMs: 2_000, fetchImpl: async (url, init) => {
  leonardoCalls += 1;
  if (String(url).endsWith('/generations')) {
    assert.equal(init?.method, 'POST');
    return new Response(JSON.stringify({sdGenerationJob: {generationId: 'leonardo-generation'}}), {status: 200});
  }
  assert.equal(String(url).endsWith('/generations/leonardo-generation'), true);
  return new Response(JSON.stringify({generations_by_pk: {status: 'COMPLETE', generated_images: [{url: 'data:image/png;base64,' + Buffer.from('leonardo-fixture').toString('base64')}]}}), {status: 200});
}});
const leonardoResult = await generateAsset(buildImageGenerationRequest({type: 'ENV-CITY', subject: 'Test City'}, {assetId: 'leonardo-smoke'}), leonardoConfig);
assert.equal(leonardoResult.status, 'ok');
assert.equal(leonardoCalls, 2);
await rm(leonardoRoot, {recursive: true, force: true});
console.log('Smoke tests passed: schema, selector, and asset prompt invariants.');
