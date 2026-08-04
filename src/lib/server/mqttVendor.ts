import { readFile } from "node:fs/promises";
import path from "node:path";

const mqttDistPath = path.join(process.cwd(), "node_modules/mqtt/dist/mqtt.min.js");

let cachedMqttScript: string | null = null;

export async function getMqttVendorResponse() {
  cachedMqttScript ??= await readFile(mqttDistPath, "utf8");

  return new Response(cachedMqttScript, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
}
