#!/usr/bin/env node
import { mkdirSync, existsSync, readdirSync, rmSync, createWriteStream, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createGzip } from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const backupDir = resolve(process.env.BACKUP_DIR || `${repoRoot}/backups`);
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || "30");

if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL before running the backup.");
  process.exit(1);
}

mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dumpFile = resolve(backupDir, `flydea-${stamp}.sql.gz`);

async function main() {
  const dump = spawn("pg_dump", [
    "--no-owner",
    "--no-privileges",
    "--format=plain",
    connectionString,
  ], { stdio: ["ignore", "pipe", "pipe"] });

  const gzip = createGzip({ level: 9 });
  const out = createWriteStream(dumpFile);

  let stderr = "";
  dump.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
  dump.stdout.pipe(gzip).pipe(out);

  await new Promise((resolvePromise, rejectPromise) => {
    dump.on("error", rejectPromise);
    out.on("error", rejectPromise);
    dump.on("close", (code) => {
      if (code !== 0) {
        rejectPromise(new Error(`pg_dump failed: ${stderr.trim()}`));
      }
    });
    out.on("close", resolvePromise);
  });

  const files = existsSync(backupDir)
    ? readdirSync(backupDir)
        .filter((file) => file.endsWith(".sql.gz"))
        .map((file) => ({ file, path: resolve(backupDir, file) }))
        .sort((a, b) => a.file.localeCompare(b.file))
    : [];

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  for (const file of files) {
    if (statSync(file.path).mtimeMs < cutoff) {
      rmSync(file.path, { force: true });
    }
  }

  console.log(`Backup created at ${dumpFile}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
