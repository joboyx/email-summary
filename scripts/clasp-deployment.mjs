/**
 * Clasp deployment helpers: resolve IDs from activeDeploymentVersion, deploy, cleanup.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const SCRIPT_URL =
  'https://script.google.com/home/projects/18591sxMWX_gcdwUgzcfiQcjzKhZGxWj1WPJPHrznwuhMNZDQbK7HaEz0/edit';

/** @returns {number} */
export function readActiveDeploymentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const version = pkg.meta?.activeDeploymentVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new Error('package.json meta.activeDeploymentVersion must be a positive integer');
  }
  return version;
}

/** @param {number} version */
export function writeActiveDeploymentVersion(version) {
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new Error(`Invalid deployment version: ${version}`);
  }

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  pkg.meta ??= {};
  pkg.meta.activeDeploymentVersion = version;
  fs.writeFileSync(`${PACKAGE_JSON}`, `${JSON.stringify(pkg, null, 2)}\n`);
}

/** @returns {Array<{ id: string; version: number | null }>} */
export function parseDeploymentsOutput(output) {
  const deployments = [];

  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    const match = trimmed.match(/^-\s+(\S+)\s+@(\d+)\.?$/);
    if (match) {
      deployments.push({ id: match[1], version: Number(match[2]) });
      continue;
    }

    if (trimmed.includes('@HEAD')) {
      const headMatch = trimmed.match(/^-\s+(\S+)\s+@HEAD/);
      if (headMatch) {
        deployments.push({ id: headMatch[1], version: null });
      }
    }
  }

  return deployments;
}

/** @returns {Array<{ id: string; version: number | null }>} */
export function listDeployments() {
  const output = execSync('npx clasp deployments', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return parseDeploymentsOutput(output);
}

/** @param {number} version */
export function resolveDeploymentId(version) {
  const deployments = listDeployments();
  const match = deployments.find((entry) => entry.version === version);
  if (!match) {
    throw new Error(
      `No clasp deployment found for @${version}. Run npm run deployments:list and set meta.activeDeploymentVersion.`,
    );
  }
  return match.id;
}

/** @param {string} deploymentId */
export function readDeploymentVersion(deploymentId) {
  const deployments = listDeployments();
  const match = deployments.find((entry) => entry.id === deploymentId);
  if (!match || match.version === null) {
    throw new Error(`Deployment ${deploymentId} not found or has no version`);
  }
  return match.version;
}

/** @param {number} version */
export function listStaleDeploymentIds(version) {
  const keepId = resolveDeploymentId(version);
  return listDeployments()
    .filter((entry) => entry.id !== keepId && entry.version !== null)
    .map((entry) => entry.id);
}

/** Push dist/ and redeploy in place; sync meta.activeDeploymentVersion from clasp. */
export function redeployInPlace() {
  const previousVersion = readActiveDeploymentVersion();
  const deploymentId = resolveDeploymentId(previousVersion);

  execSync('npx clasp push --force', { cwd: ROOT, stdio: 'inherit' });
  execSync(`npx clasp deploy -i "${deploymentId}"`, { cwd: ROOT, stdio: 'inherit' });

  const nextVersion = readDeploymentVersion(deploymentId);
  writeActiveDeploymentVersion(nextVersion);

  console.log(
    `Redeployed ${deploymentId} @${previousVersion} → @${nextVersion}. Updated meta.activeDeploymentVersion.`,
  );
  console.log(SCRIPT_URL);

  return { deploymentId, previousVersion, nextVersion };
}

const command = process.argv[2];
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  switch (command) {
    case 'id': {
      console.log(resolveDeploymentId(readActiveDeploymentVersion()));
      break;
    }
    case 'deploy': {
      redeployInPlace();
      break;
    }
    case 'cleanup': {
      const staleIds = listStaleDeploymentIds(readActiveDeploymentVersion());
      for (const id of staleIds) {
        execSync(`npx clasp undeploy ${id}`, { cwd: ROOT, stdio: 'inherit' });
      }
      execSync('npx clasp deployments', { cwd: ROOT, stdio: 'inherit' });
      break;
    }
    default:
      console.error('Usage: node scripts/clasp-deployment.mjs <id|deploy|cleanup>');
      process.exit(1);
  }
}
