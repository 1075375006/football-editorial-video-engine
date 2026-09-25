import {readFile} from 'node:fs/promises';
import {validateSceneDocument} from '../engine/src/schema';

const file = process.argv[2] ?? 'examples/demo-scene-spec.json';
const document = JSON.parse(await readFile(file, 'utf8')) as unknown;
const result = validateSceneDocument(document);
for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
if (!result.valid) {
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log(`SceneSpec valid: ${file}`);
