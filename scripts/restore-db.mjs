#!/usr/bin/env node
import { createReadStream } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const backupFile = process.argv[2] || process.env.BACKUP_FILE;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!backupFile) {
  console.error("Pass a backup file path or set BACKUP_FILE.");
  process.exit(1);
}

if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL before restoring.");
  process.exit(1);
}

const input = createReadStream(resolve(repoRoot, backupFile));
const gunzip = createGunzip();
const restore = spawn("psql", [connectionString], { stdio: ["pipe", "inherit", "inherit"] });

input.pipe(gunzip).pipe(restore.stdin);

restore.on("close", (code) => {
  if (code !== 0) {
    console.error(`psql exited with code ${code}`);
    process.exit(code || 1);
  }
  console.log("Restore completed.");
});

restore.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
