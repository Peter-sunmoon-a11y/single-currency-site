import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(rootDir, "node_modules", "mqtt", "dist", "mqtt.min.js");
const outputPath = path.join(rootDir, "public", "vendor", "mqtt");

try {
  const script = await readFile(sourcePath, "utf8");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, script);
  console.log(`Synced mqtt vendor asset: ${path.relative(rootDir, outputPath)}`);
} catch (error) {
  console.error(`Failed to sync mqtt vendor asset from ${path.relative(rootDir, sourcePath)}`);
  throw error;
}
