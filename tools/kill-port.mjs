import { execFileSync } from "node:child_process";
import process from "node:process";

const port = process.argv[2];

if (!port || !/^\d+$/.test(port)) {
  console.error("Usage: node tools/kill-port.mjs <port>");
  process.exit(1);
}

function getUnixPids(targetPort) {
  try {
    const output = execFileSync("lsof", ["-ti", `tcp:${targetPort}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return output
      .split(/\s+/)
      .map((pid) => pid.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function killUnixPids(pids) {
  for (const pid of pids) {
    if (pid === String(process.pid)) continue;

    try {
      process.kill(Number(pid), "SIGTERM");
      console.log(`Stopped process ${pid} on port ${port}`);
    } catch (error) {
      if (error?.code !== "ESRCH") {
        console.warn(`Failed to stop process ${pid}: ${error.message}`);
      }
    }
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForUnixPort(targetPort, timeoutMs = 2000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const pids = getUnixPids(targetPort).filter((pid) => pid !== String(process.pid));
    if (pids.length === 0) return true;
    sleep(100);
  }

  return false;
}

function forceKillUnixPort(targetPort) {
  const pids = getUnixPids(targetPort).filter((pid) => pid !== String(process.pid));

  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGKILL");
      console.log(`Force stopped process ${pid} on port ${targetPort}`);
    } catch (error) {
      if (error?.code !== "ESRCH") {
        console.warn(`Failed to force stop process ${pid}: ${error.message}`);
      }
    }
  }
}

function killWindowsPort(targetPort) {
  let output = "";

  try {
    output = execFileSync("netstat", ["-ano", "-p", "tcp"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return;
  }

  const pids = new Set();
  const listenPattern = new RegExp(`[:.]${targetPort}\\s+.*\\s+LISTENING\\s+(\\d+)`, "i");

  for (const line of output.split(/\r?\n/)) {
    const match = line.match(listenPattern);
    if (match?.[1] && match[1] !== String(process.pid)) {
      pids.add(match[1]);
    }
  }

  for (const pid of pids) {
    try {
      execFileSync("taskkill", ["/PID", pid, "/F"], { stdio: "ignore" });
      console.log(`Stopped process ${pid} on port ${port}`);
    } catch (error) {
      console.warn(`Failed to stop process ${pid}: ${error.message}`);
    }
  }
}

if (process.platform === "win32") {
  killWindowsPort(port);
} else {
  killUnixPids(getUnixPids(port));
  if (!waitForUnixPort(port)) {
    forceKillUnixPort(port);
  }
}
