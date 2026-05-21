import fs from 'fs';
import path from 'path';
import vm from 'vm';
import ts from 'typescript';
import { createGasTestMocks, installGasMocks, resetGasTestMocks } from './gas-mocks';

const SOURCE_ORDER = [
  'config.ts',
  'gmail-search.ts',
  'openrouter.ts',
  'html-format.ts',
  'gmail-actions.ts',
  'main.ts',
];

let loaded = false;
let sandbox: vm.Context;

/** Keep the VM sandbox on Jest's Date (including fake timers). */
function syncSandboxDate(target: vm.Context): void {
  Object.defineProperty(target, 'Date', {
    value: Date,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

export function gas(): GasTestGlobals {
  syncSandboxDate(sandbox);
  return sandbox as unknown as GasTestGlobals;
}

export function setSandboxValue(name: string, value: unknown): void {
  Object.defineProperty(sandbox, name, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

export function runInFreshSandbox<T>(customize: (mocks: GasTestMocks) => void, fn: (api: GasTestGlobals) => T): T {
  const mocks = createGasTestMocks();
  customize(mocks);

  const isolatedSandbox = vm.createContext({ ...global });
  syncSandboxDate(isolatedSandbox);
  installGasMocks(mocks, isolatedSandbox as unknown as typeof globalThis);

  for (const file of SOURCE_ORDER) {
    const filePath = path.join(process.cwd(), 'src', file);
    const source = fs.readFileSync(filePath, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2019,
        module: ts.ModuleKind.None,
        strict: true,
        sourceMap: true,
      },
      fileName: filePath,
    });

    vm.runInContext(outputText, isolatedSandbox, { filename: filePath });
  }

  return fn(isolatedSandbox as unknown as GasTestGlobals);
}

export function loadSource(): void {
  if (loaded) {
    return;
  }

  const mocks = createGasTestMocks();
  sandbox = vm.createContext({ ...global });
  installGasMocks(mocks, sandbox as unknown as typeof globalThis);
  globalThis.gasTestMocks = mocks;

  for (const file of SOURCE_ORDER) {
    const filePath = path.join(process.cwd(), 'src', file);
    const source = fs.readFileSync(filePath, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2019,
        module: ts.ModuleKind.None,
        strict: true,
        sourceMap: true,
      },
      fileName: filePath,
    });

    vm.runInContext(outputText, sandbox, { filename: filePath });
  }

  loaded = true;
}

export function resetSourceState(): void {
  resetGasTestMocks(globalThis.gasTestMocks);

  setSandboxValue('EMAIL_SEND_ENABLED', true);
  setSandboxValue('EMAIL_ARCHIVE_ENABLED', true);
  setSandboxValue('EMAIL_LABEL_ENABLED', true);
  setSandboxValue('OPENROUTER_API_KEY', 'test-api-key');

  vm.runInContext(
    'Object.keys(labelCache).forEach(function (key) { delete labelCache[key]; });',
    sandbox,
  );
}
