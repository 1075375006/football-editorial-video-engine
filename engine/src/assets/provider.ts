import {createHash} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {compileAssetPrompt, ASSET_NEGATIVE_PROMPT} from '../assetPlanner';
import type {AssetRequest} from '../types';

export type ImageProviderId = 'none' | 'openai-compatible' | 'leonardo';

export interface ImageGenerationRequest {
  assetId: string;
  request: AssetRequest;
  prompt?: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
  numImages?: number;
}

export interface ImageArtifact {
  localPath: string;
  mimeType: string;
  sha256: string;
  provider: ImageProviderId;
  requestId?: string;
}

export interface ImageGenerationResult {
  status: 'ok' | 'fallback';
  provider: ImageProviderId;
  artifacts: ImageArtifact[];
  requestId?: string;
  warning?: string;
  prompt: string;
}

export interface ImageProvider {
  readonly id: ImageProviderId;
  generate(request: ImageGenerationRequest, signal?: AbortSignal): Promise<ImageGenerationResult>;
}

export interface ImageProviderConfig {
  provider: ImageProviderId;
  apiKey?: string;
  baseUrl: string;
  model?: string;
  generatePath: string;
  statusPath: string;
  workspaceRoot: string;
  outputRoot: string;
  timeoutMs: number;
  pollIntervalMs: number;
  pollTimeoutMs: number;
  dryRun: boolean;
  strict: boolean;
  extraHeaders: Record<string, string>;
  fetchImpl?: FetchLike;
}

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;
export type Environment = Record<string, string | undefined>;

const DEFAULTS = {
  openaiBaseUrl: 'https://api.openai.com/v1',
  leonardoBaseUrl: 'https://cloud.leonardo.ai/api/rest/v1',
  timeoutMs: 45_000,
  pollIntervalMs: 2_000,
  pollTimeoutMs: 120_000,
  maxPromptLength: 12_000,
} as const;

const firstEnv = (env: Environment, ...keys: string[]): string | undefined => keys.map((key) => env[key]?.trim()).find(Boolean);

const numberEnv = (env: Environment, fallback: number, key: string, minimum: number, maximum: number): number => {
  const parsed = Number(env[key]);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(parsed)));
};

const boolEnv = (env: Environment, key: string): boolean => ['1', 'true', 'yes', 'on'].includes((env[key] ?? '').trim().toLowerCase());

const providerId = (value: string | undefined): ImageProviderId => {
  const normalized = (value ?? 'none').toLowerCase();
  if (normalized === 'openai' || normalized === 'openai-compatible' || normalized === 'compatible') return 'openai-compatible';
  if (normalized === 'leonardo' || normalized === 'leonardo-ai') return 'leonardo';
  return 'none';
};

const parseHeaders = (value: string | undefined): Record<string, string> => {
  if (!value) return {};
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('FEE_IMAGE_EXTRA_HEADERS_JSON must be a JSON object');
  return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([, item]) => typeof item === 'string')) as Record<string, string>;
};

export const loadImageProviderConfig = (env: Environment = process.env, overrides: Partial<ImageProviderConfig> = {}): ImageProviderConfig => {
  const provider = providerId(firstEnv(env, 'FEE_IMAGE_PROVIDER', 'IMAGE_PROVIDER'));
  const defaultBase = provider === 'leonardo'
    ? firstEnv(env, 'LEONARDO_API_BASE_URL') ?? DEFAULTS.leonardoBaseUrl
    : DEFAULTS.openaiBaseUrl;
  const configuredBase = firstEnv(env, 'FEE_IMAGE_BASE_URL', 'IMAGE_API_BASE_URL') ?? defaultBase;
  const relayBase = firstEnv(env, 'FEE_IMAGE_RELAY_URL', 'IMAGE_API_RELAY_URL');
  const apiKey = provider === 'leonardo'
    ? firstEnv(env, 'LEONARDO_API_KEY')
    : firstEnv(env, 'FEE_IMAGE_API_KEY', 'IMAGE_API_KEY', 'OPENAI_API_KEY');
  const workspaceRoot = path.resolve(firstEnv(env, 'FEE_WORKSPACE_ROOT') ?? process.cwd());
  const outputRoot = path.resolve(workspaceRoot, firstEnv(env, 'FEE_IMAGE_OUTPUT_ROOT') ?? '.');
  return {
    provider,
    apiKey,
    baseUrl: relayBase ?? configuredBase,
    model: provider === 'leonardo' ? firstEnv(env, 'LEONARDO_MODEL_ID', 'FEE_IMAGE_MODEL') : firstEnv(env, 'FEE_IMAGE_MODEL', 'IMAGE_MODEL'),
    generatePath: firstEnv(env, 'FEE_IMAGE_GENERATE_PATH') ?? (provider === 'leonardo' ? '/generations' : '/images/generations'),
    statusPath: firstEnv(env, 'FEE_IMAGE_STATUS_PATH') ?? '/generations/{id}',
    workspaceRoot,
    outputRoot,
    timeoutMs: numberEnv(env, DEFAULTS.timeoutMs, 'FEE_IMAGE_TIMEOUT_MS', 2_000, 300_000),
    pollIntervalMs: numberEnv(env, DEFAULTS.pollIntervalMs, 'FEE_IMAGE_POLL_INTERVAL_MS', 250, 30_000),
    pollTimeoutMs: numberEnv(env, DEFAULTS.pollTimeoutMs, 'FEE_IMAGE_POLL_TIMEOUT_MS', 2_000, 900_000),
    dryRun: boolEnv(env, 'FEE_IMAGE_DRY_RUN'),
    strict: boolEnv(env, 'FEE_IMAGE_STRICT'),
    extraHeaders: parseHeaders(firstEnv(env, 'FEE_IMAGE_EXTRA_HEADERS_JSON')),
    ...overrides,
  };
};

const ensureSafeUrl = (raw: string): URL => {
  const url = new URL(raw);
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localHttp) throw new Error('Image API base URL must use HTTPS; HTTP is allowed only for localhost relays');
  return url;
};

const joinUrl = (base: string, endpoint: string): string => {
  const url = ensureSafeUrl(base);
  const basePath = url.pathname.replace(/\/$/, '');
  const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  url.pathname = `${basePath}${endpointPath}`;
  return url.toString();
};

const safeAssetName = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'asset';

const allowedAssetRoot = (workspaceRoot: string, outputRoot: string, request: AssetRequest): string => {
  const directory = request.type.startsWith('ENV-') ? 'assets/environments' : 'assets/subjects';
  const root = path.resolve(outputRoot, directory);
  const workspace = path.resolve(workspaceRoot);
  const relative = path.relative(workspace, root);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Image output must stay inside the workspace assets directory');
  return root;
};

const mimeExtension = (mimeType: string): string => mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

const requestPrompt = (input: ImageGenerationRequest): string => {
  const prompt = input.prompt?.trim() || compileAssetPrompt(input.request);
  if (!prompt) throw new Error('Image generation prompt is required');
  if (prompt.length > DEFAULTS.maxPromptLength) throw new Error(`Image generation prompt exceeds ${DEFAULTS.maxPromptLength} characters`);
  return prompt;
};

const normalizedDimensions = (input: ImageGenerationRequest): {width: number; height: number} => ({
  width: Math.max(256, Math.min(1536, Math.round(input.width ?? 1024))),
  height: Math.max(256, Math.min(1536, Math.round(input.height ?? 1024))),
});

const fetchWithTimeout = async (config: ImageProviderConfig, input: string, init: RequestInit, signal?: AbortSignal): Promise<Response> => {
  const fetchImpl = config.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, {once: true});
  try {
    return await fetchImpl(input, {...init, signal: controller.signal});
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
};

const readJson = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text();
  let parsed: unknown;
  try { parsed = text ? JSON.parse(text) : {}; } catch { throw new Error(`Image API returned invalid JSON (HTTP ${response.status})`); }
  if (!response.ok) throw new Error(`Image API request failed (HTTP ${response.status})`);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Image API response must be a JSON object');
  return parsed as Record<string, unknown>;
};

const headersFor = (config: ImageProviderConfig): Record<string, string> => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  ...(config.apiKey ? {Authorization: `Bearer ${config.apiKey}`} : {}),
  ...config.extraHeaders,
});

const persistImage = async (config: ImageProviderConfig, input: ImageGenerationRequest, provider: ImageProviderId, bytes: Uint8Array, mimeType: string, index: number, requestId?: string): Promise<ImageArtifact> => {
  const directory = allowedAssetRoot(config.workspaceRoot, config.outputRoot, input.request);
  await mkdir(directory, {recursive: true});
  const digest = sha256(bytes);
  const filename = `${safeAssetName(input.assetId)}-${digest.slice(0, 12)}-${index + 1}.${mimeExtension(mimeType)}`;
  const target = path.join(directory, filename);
  await writeFile(target, bytes);
  return {localPath: path.relative(config.workspaceRoot, target).replaceAll(path.sep, '/'), mimeType, sha256: digest, provider, requestId};
};

const dataUrlBytes = (value: string): {bytes: Uint8Array; mimeType: string} | undefined => {
  const match = value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  return match ? {bytes: Buffer.from(match[2], 'base64'), mimeType: match[1].toLowerCase()} : undefined;
};

const downloadImage = async (config: ImageProviderConfig, value: string, signal?: AbortSignal): Promise<{bytes: Uint8Array; mimeType: string}> => {
  const data = dataUrlBytes(value);
  if (data) return data;
  const url = ensureSafeUrl(value);
  const response = await fetchWithTimeout(config, url.toString(), {method: 'GET', headers: {Accept: 'image/*'}}, signal);
  if (!response.ok) throw new Error(`Image download failed (HTTP ${response.status})`);
  const mimeType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (!mimeType.startsWith('image/')) throw new Error('Image API returned a non-image URL');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 20 * 1024 * 1024) throw new Error('Generated image exceeds the 20 MB safety limit');
  return {bytes, mimeType};
};

abstract class ProviderBase {
  abstract readonly id: ImageProviderId;
  constructor(protected readonly config: ImageProviderConfig) {}

  protected fallback(input: ImageGenerationRequest, error: unknown): ImageGenerationResult {
    const warning = error instanceof Error ? error.message : 'Image provider failed';
    if (this.config.strict) throw new Error(warning);
    return {status: 'fallback', provider: this.id, artifacts: [], warning, prompt: requestPrompt(input)};
  }

  protected async artifactsFromUrls(input: ImageGenerationRequest, urls: string[], requestId: string | undefined, signal?: AbortSignal): Promise<ImageArtifact[]> {
    const artifacts: ImageArtifact[] = [];
    for (const [index, url] of urls.entries()) {
      const image = await downloadImage(this.config, url, signal);
      artifacts.push(await persistImage(this.config, input, this.id, image.bytes, image.mimeType, index, requestId));
    }
    return artifacts;
  }
}

class NoneProvider implements ImageProvider {
  readonly id = 'none' as const;
  async generate(input: ImageGenerationRequest): Promise<ImageGenerationResult> {
    return {status: 'fallback', provider: this.id, artifacts: [], warning: 'No image provider configured; using the deterministic placeholder.', prompt: requestPrompt(input)};
  }
}

class OpenAICompatibleProvider extends ProviderBase {
  readonly id = 'openai-compatible' as const;
  async generate(input: ImageGenerationRequest, signal?: AbortSignal): Promise<ImageGenerationResult> {
    const prompt = requestPrompt(input);
    if (this.config.dryRun) return {status: 'fallback', provider: this.id, artifacts: [], warning: 'FEE_IMAGE_DRY_RUN is enabled; no request was sent.', prompt};
    if (!this.config.apiKey) return this.fallback(input, new Error('FEE_IMAGE_API_KEY or IMAGE_API_KEY is required for the OpenAI-compatible provider'));
    try {
      const {width, height} = normalizedDimensions(input);
      const body = {
        model: input.model ?? this.config.model ?? 'gpt-image-1',
        prompt,
        size: `${width}x${height}`,
        n: Math.max(1, Math.min(4, Math.round(input.numImages ?? 1))),
        response_format: 'b64_json',
      };
      const response = await fetchWithTimeout(this.config, joinUrl(this.config.baseUrl, this.config.generatePath), {method: 'POST', headers: headersFor(this.config), body: JSON.stringify(body)}, signal);
      const payload = await readJson(response);
      const data = Array.isArray(payload.data) ? payload.data : [];
      const urls = data.map((item) => {
        if (!item || typeof item !== 'object') return undefined;
        const record = item as Record<string, unknown>;
        if (typeof record.b64_json === 'string') return `data:image/png;base64,${record.b64_json}`;
        return typeof record.url === 'string' ? record.url : undefined;
      }).filter((item): item is string => Boolean(item));
      if (urls.length === 0) throw new Error('OpenAI-compatible response did not contain image data');
      const requestId = typeof payload.id === 'string' ? payload.id : undefined;
      return {status: 'ok', provider: this.id, artifacts: await this.artifactsFromUrls(input, urls, requestId, signal), requestId, prompt};
    } catch (error) {
      return this.fallback(input, error);
    }
  }
}

class LeonardoProvider extends ProviderBase {
  readonly id = 'leonardo' as const;
  async generate(input: ImageGenerationRequest, signal?: AbortSignal): Promise<ImageGenerationResult> {
    const prompt = requestPrompt(input);
    if (this.config.dryRun) return {status: 'fallback', provider: this.id, artifacts: [], warning: 'FEE_IMAGE_DRY_RUN is enabled; no request was sent.', prompt};
    if (!this.config.apiKey) return this.fallback(input, new Error('LEONARDO_API_KEY is required for the Leonardo provider'));
    try {
      const {width, height} = normalizedDimensions(input);
      const body: Record<string, unknown> = {
        prompt,
        width,
        height,
        num_images: Math.max(1, Math.min(4, Math.round(input.numImages ?? 1))),
      };
      if (input.model ?? this.config.model) body.modelId = input.model ?? this.config.model;
      if (input.seed !== undefined) body.seed = input.seed;
      const response = await fetchWithTimeout(this.config, joinUrl(this.config.baseUrl, this.config.generatePath), {method: 'POST', headers: headersFor(this.config), body: JSON.stringify(body)}, signal);
      const created = await readJson(response);
      const job = created.sdGenerationJob && typeof created.sdGenerationJob === 'object' ? created.sdGenerationJob as Record<string, unknown> : created;
      const generationId = typeof job.generationId === 'string' ? job.generationId : typeof created.generationId === 'string' ? created.generationId : undefined;
      if (!generationId) throw new Error('Leonardo response did not contain a generation id');
      const urls = await this.poll(generationId, signal);
      return {status: 'ok', provider: this.id, artifacts: await this.artifactsFromUrls(input, urls, generationId, signal), requestId: generationId, prompt};
    } catch (error) {
      return this.fallback(input, error);
    }
  }

  private async poll(generationId: string, signal?: AbortSignal): Promise<string[]> {
    const deadline = Date.now() + this.config.pollTimeoutMs;
    const endpoint = this.config.statusPath.replace('{id}', encodeURIComponent(generationId));
    while (Date.now() <= deadline) {
      const response = await fetchWithTimeout(this.config, joinUrl(this.config.baseUrl, endpoint), {method: 'GET', headers: headersFor(this.config)}, signal);
      const payload = await readJson(response);
      const record = payload.generations_by_pk && typeof payload.generations_by_pk === 'object' ? payload.generations_by_pk as Record<string, unknown> : payload;
      const images = Array.isArray(record.generated_images) ? record.generated_images : [];
      const urls = images.map((image) => image && typeof image === 'object' && typeof (image as Record<string, unknown>).url === 'string' ? (image as Record<string, unknown>).url as string : undefined).filter((item): item is string => Boolean(item));
      if (urls.length > 0) return urls;
      const status = String(record.status ?? '').toLowerCase();
      if (status.includes('fail') || status.includes('error')) throw new Error(`Leonardo generation failed with status ${status}`);
      await new Promise((resolve) => setTimeout(resolve, this.config.pollIntervalMs));
    }
    throw new Error('Leonardo generation polling timed out');
  }
}

export const createImageProvider = (config: ImageProviderConfig = loadImageProviderConfig()): ImageProvider => {
  if (config.provider === 'openai-compatible') return new OpenAICompatibleProvider(config);
  if (config.provider === 'leonardo') return new LeonardoProvider(config);
  return new NoneProvider();
};

export const generateAsset = async (input: ImageGenerationRequest, config: ImageProviderConfig = loadImageProviderConfig()): Promise<ImageGenerationResult> => {
  const provider = createImageProvider(config);
  return provider.generate(input);
};

export const buildImageGenerationRequest = (request: AssetRequest, options: Partial<Omit<ImageGenerationRequest, 'request'>> = {}): ImageGenerationRequest => ({
  assetId: safeAssetName(`${request.type}-${request.subject}`),
  request,
  negativePrompt: ASSET_NEGATIVE_PROMPT,
  ...options,
});
