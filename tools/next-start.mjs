import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = process.argv[2] ?? "3000";
const host = process.env.HOST ?? "0.0.0.0";

if (!/^\d+$/.test(port)) {
  console.error("Usage: node tools/next-start.mjs <port>");
  process.exit(1);
}

const run = (command, args, options = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      ...options,
    });

    child.on("close", (code, signal) => resolve({ code, signal }));
    child.on("error", (error) => {
      console.error(error);
      resolve({ code: 1, signal: null });
    });
  });

await run(process.execPath, ["tools/sync-mqtt-vendor.mjs"]);

const killPort = () => run(process.execPath, ["tools/kill-port.mjs", port]);

await killPort();

if (host === "0.0.0.0") {
  const interfaces = os.networkInterfaces();
  const lanHosts = Object.values(interfaces)
    .flat()
    .filter((details) => details && details.family === "IPv4" && !details.internal)
    .map((details) => details.address);
  const hostname = os.hostname();
  const lanHostname = hostname.endsWith(".local") ? hostname : `${hostname}.local`;

  console.log("");
  console.log(`LAN Hostname: http://${lanHostname}:${port}`);
  lanHosts.forEach((address) => {
    console.log(`LAN Address:  http://${address}:${port}`);
  });
  console.log("");
}

const nextBin = path.join(rootDir, "node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");
const next = spawn(nextBin, ["start", "-H", host, "-p", port], {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env,
});

let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  if (next.exitCode === null && next.signalCode === null) {
    next.kill(signal);
  }

  setTimeout(() => {
    if (next.exitCode === null && next.signalCode === null) {
      next.kill("SIGKILL");
    }
  }, 2000).unref();
};

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    shutdown(signal);
  });
}

next.on("close", async (code, signal) => {
  await killPort();
  if (signal) {
    const signalExitCodes = {
      SIGHUP: 129,
      SIGINT: 130,
      SIGTERM: 143,
    };
    process.exit(signalExitCodes[signal] ?? 1);
    return;
  }
  process.exit(code ?? 0);
});
