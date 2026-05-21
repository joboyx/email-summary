import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true });
}

execSync("npx tsc", { cwd: root, stdio: "inherit" });

mkdirSync(distDir, { recursive: true });
copyFileSync(join(root, "src", "appsscript.json"), join(distDir, "appsscript.json"));

console.log("Build complete: dist/");
