# Image Asset Spec and prompt boundaries

Image generation is optional. It supplies atmosphere and silhouettes, not facts. Use a typed request before compiling a provider prompt:

```yaml
asset:
  type: SUB-PLAYER
  subject: Bukayo Saka
  pose: running
  orientation: facing-left
  treatment: editorial-cutout
```

Supported types are `ENV-STADIUM`, `ENV-CITY`, `ENV-HISTORY`, `SUB-PLAYER`, `SUB-COACH`, `SUB-TROPHY`, and `SUB-STADIUM`.

## Required negative prompt

Every compiled prompt includes:

```text
NO TEXT, NO NUMBERS, NO SCORE, NO DATE, NO LOGOS, NO CRESTS,
NO UI, NO INFOGRAPHIC, NO WATERMARK, NO GENERATED LABELS
```

Use accurate, licensed crests and provider-approved player references separately. Never ask an image model to draw a scoreline, xG, injury state, date, or tactical arrow. `compileAssetPrompt()` adds these constraints and reports the asset type so a failed request can fall back to a placeholder.

Do not commit generated or unlicensed media. Put local assets in `assets/environments/` or `assets/subjects/`; the repository ignores their contents by default.

## Optional provider adapters

Image generation runs before Remotion rendering. The renderer only reads local assets, so the video remains deterministic and works without a network connection. The adapter entry point is [`engine/src/assets/provider.ts`](../engine/src/assets/provider.ts), and the CLI is:

```bash
npm run generate:asset -- --input examples/image-request.json
```

The default provider is `none`; it returns a fallback result and never makes a network request. To use an OpenAI-compatible provider or a transparent relay, set:

```dotenv
FEE_IMAGE_PROVIDER=openai-compatible
FEE_IMAGE_API_KEY=replace-me
FEE_IMAGE_BASE_URL=https://api.openai.com/v1
FEE_IMAGE_RELAY_URL=https://your-gateway.example/v1
FEE_IMAGE_MODEL=gpt-image-1
```

When `FEE_IMAGE_RELAY_URL` is present it replaces the base URL, while the adapter keeps the same `/images/generations` request and response shape. This supports a gateway or中转服务 without putting provider-specific code into the Skill or SceneSpec. A local HTTP relay is allowed for `localhost`; remote endpoints must use HTTPS.

Leonardo AI has its own asynchronous adapter and polling step:

```dotenv
FEE_IMAGE_PROVIDER=leonardo
LEONARDO_API_KEY=replace-me
LEONARDO_API_BASE_URL=https://cloud.leonardo.ai/api/rest/v1
LEONARDO_MODEL_ID=replace-with-model-id
```

`LEONARDO_API_BASE_URL` can point to a trusted HTTPS relay that preserves `/generations` and `/generations/{id}`. The adapter downloads the completed image into the ignored assets directory and returns a local artifact with its SHA-256 hash. The API key is never included in the SceneSpec, manifest, logs, or Git commit.

Use `FEE_IMAGE_DRY_RUN=1` to inspect the compiled request without sending it. Provider failures return `status: "fallback"` so offline video rendering continues; set `FEE_IMAGE_STRICT=1` or pass `--strict-assets` when a production job should fail instead. Add a provider by implementing the `ImageProvider` interface and registering it in `createImageProvider()`; keep all HTTP and response-shape details inside that adapter.
