#!/usr/bin/env node
import { readdirSync, statSync, unlinkSync, createReadStream, createWriteStream } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const backupDir = resolve(process.env.BACKUP_DIR || `${repoRoot}/backups`);
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function getLatestBackup() {
  const files = readdirSync(backupDir)
    .filter(f => f.endsWith(".sql.gz"))
    .map(f => ({
      name: f,
      path: resolve(backupDir, f),
      mtime: statSync(resolve(backupDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    throw new Error("No backup files found");
  }
  return files[0];
}

async function restoreDrill(backupFile, testDbUrl) {
  if (!testDbUrl) {
    console.log("No test database URL provided. Running dry-run test...");
    const fileStat = statSync(backupFile.path);
    console.log(`✓ Backup exists: ${backupFile.name} (${(fileStat.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log("✓ Restore drill completed (dry-run)");
    return true;
  }

  console.log(`Restoring to test database...`);
  
  const gunzip = createGunzip();
  const psql = spawn("psql", [testDbUrl], {
    stdio: ["pipe", "pipe", "pipe"]
  });

  const readStream = createReadStream(backupFile.path);
  
  await pipeline(readStream, gunzip, psql.stdin);
  
  return new Promise((resolve, reject) => {
    psql.on("close", (code) => {
      if (code === 0) {
        console.log("✓ Restore drill successful");
        resolve(true);
      } else {
        reject(new Error(`psql exited with code ${code}`));
      }
    });
    psql.on("error", reject);
  });
}

async function main() {
  console.log("=== FlyDea Restore Drill ===\n");
  
  try {
    const latest = await getLatestBackup();
    console.log(`Latest backup: ${latest.name}`);
    
    const testDbUrl = process.env.TEST_DATABASE_URL;
    await restoreDrill(latest, testDbUrl);
    
    console.log("\n=== Drill Completed Successfully ===");
  } catch (e) {
    console.error("Drill failed:", e.message);
    process.exit(1);
  }
}

main();