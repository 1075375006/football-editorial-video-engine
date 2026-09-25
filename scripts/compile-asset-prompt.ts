import {compileAssetPrompt} from '../engine/src/assetPlanner';
import type {AssetRequest} from '../engine/src/types';

const input = process.argv[2] ?? (await new Promise<string>((resolve) => {
  let value = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { value += chunk; });
  process.stdin.on('end', () => resolve(value));
}));
const request = (input.trim() ? JSON.parse(input) : {type: 'SUB-PLAYER', subject: 'football player', pose: 'standing', orientation: 'facing-left', treatment: 'editorial-cutout'}) as AssetRequest;
console.log(compileAssetPrompt(request));
