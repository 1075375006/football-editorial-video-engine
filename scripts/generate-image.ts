import {readFile} from 'node:fs/promises';
import {buildImageGenerationRequest, generateAsset, loadImageProviderConfig, type ImageGenerationRequest} from '../engine/src/assets/provider';
import type {AssetRequest} from '../engine/src/types';

const args = process.argv.slice(2);
const valueAfter = (flag: string): string | undefined => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const inputPath = valueAfter('--input');
const providerOverride = valueAfter('--provider');
const modelOverride = valueAfter('--model');
const strict = args.includes('--strict-assets');
const dryRun = args.includes('--dry-run');

const inputText = inputPath ? await readFile(inputPath, 'utf8') : await new Promise<string>((resolve) => {
  let value = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { value += chunk; });
  process.stdin.on('end', () => resolve(value));
});

const parsed = JSON.parse(inputText.trim()) as Partial<ImageGenerationRequest> & {request?: AssetRequest};
if (!parsed.request) throw new Error('Input must contain a request object');

const env = {...process.env};
if (providerOverride) env.FEE_IMAGE_PROVIDER = providerOverride;
if (modelOverride) env.FEE_IMAGE_MODEL = modelOverride;
if (dryRun) env.FEE_IMAGE_DRY_RUN = '1';
if (strict) env.FEE_IMAGE_STRICT = '1';

const config = loadImageProviderConfig(env);
const request = buildImageGenerationRequest(parsed.request, {
  assetId: parsed.assetId,
  prompt: parsed.prompt,
  negativePrompt: parsed.negativePrompt,
  width: parsed.width,
  height: parsed.height,
  model: parsed.model,
  seed: parsed.seed,
  numImages: parsed.numImages,
});
const result = await generateAsset(request, config);
console.log(JSON.stringify(result, null, 2));
if (result.status === 'fallback' && config.strict) process.exitCode = 1;

