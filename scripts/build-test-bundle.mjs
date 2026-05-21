/**
 * Concatenates src modules in Apps Script load order for the Jest harness.
 * Output is gitignored under test/.generated/.
 */
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'test', '.generated');
const OUT_FILE = path.join(OUT_DIR, 'email-summary.js');

const SOURCE_ORDER = [
  'config.ts',
  'gmail-search.ts',
  'openrouter.ts',
  'html-format.ts',
  'gmail-actions.ts',
  'main.ts',
];

const sections = SOURCE_ORDER.map((file) => {
  const filePath = path.join(ROOT, 'src', file);
  return { file, filePath, source: fs.readFileSync(filePath, 'utf8') };
});

const combinedSource = sections
  .map(({ file, source }) => `// --- ${file} ---\n${source}`)
  .join('\n\n');

const result = ts.transpileModule(combinedSource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2019,
    module: ts.ModuleKind.None,
    strict: true,
    sourceMap: true,
    inlineSources: true,
  },
  fileName: path.join(OUT_DIR, 'email-summary.ts'),
});

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, result.outputText);

if (result.sourceMapText) {
  fs.writeFileSync(`${OUT_FILE}.map`, result.sourceMapText);
}

console.log(`Wrote ${path.relative(ROOT, OUT_FILE)}`);
