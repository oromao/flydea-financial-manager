#!/usr/bin/env python3
import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime

BRAIN_PATH = Path("/Users/paulo/Documents/Obsidian Vault/brain")
PROJECT_NAME = "flydea-financial-manager"
PROJECT_BRAIN_DIR = BRAIN_PATH / "projects" / PROJECT_NAME

def run_cmd(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, text=True).strip()
    except subprocess.CalledProcessError:
        return ""

def get_git_info():
    branch = run_cmd("git rev-parse --abbrev-ref HEAD")
    commit_hash = run_cmd("git rev-parse --short HEAD")
    commit_msg = run_cmd("git log -1 --pretty=%B")
    changed_files = run_cmd("git diff --name-only HEAD").split('\n')
    changed_files = [f for f in changed_files if f]
    
    if not changed_files:
        changed_files = run_cmd("git diff --name-only HEAD~1 HEAD").split('\n')
        changed_files = [f for f in changed_files if f]

    return {
        "branch": branch,
        "hash": commit_hash,
        "message": commit_msg,
        "files": changed_files
    }

def categorize_commit(msg, files):
    msg_lower = msg.lower()
    if any(k in msg_lower for k in ["feat", "add", "new"]): return "feature"
    if any(k in msg_lower for k in ["fix", "bug", "patch"]): return "fix"
    if any(k in msg_lower for k in ["refactor", "clean"]): return "refactor"
    if any(k in msg_lower for k in ["test"]): return "test"
    if any(k in msg_lower for k in ["docs", "doc"]): return "docs"
    if any(f.startswith(".github") or f.endswith(".json") for f in files): return "infra"
    return "chore"

def snapshot_memory():
    info = get_git_info()
    if not info["hash"]:
        print("No git repository or commits found.")
        return

    category = categorize_commit(info["message"], info["files"])
    
    commits_dir = PROJECT_BRAIN_DIR / "commits"
    os.makedirs(commits_dir, exist_ok=True)
    
    commit_file = commits_dir / f"commit-{info['hash']}.md"
    
    content = f"""# Commit {info['hash']}
- **Branch:** {info['branch']}
- **Date:** {datetime.now().isoformat()}
- **Category:** {category}

## Message
{info['message']}

## Changed Files
"""
    for f in info["files"][:15]:
        content += f"- `{f}`\n"
    if len(info["files"]) > 15:
        content += f"- ... and {len(info['files']) - 15} more\n"

    content += "\n## Impact & Memory\n- Automatically captured by Git Memory Snapshot.\n"

    try:
        with open(commit_file, "w") as f:
            f.write(content)
        print(f"✅ Created commit memory: {commit_file}")
    except Exception as e:
        print(f"❌ Failed to write commit memory: {e}")

if __name__ == "__main__":
    snapshot_memory()
