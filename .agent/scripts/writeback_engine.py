#!/usr/bin/env python3
import os
import sys
import subprocess
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

def writeback_memory(task_summary="Automated meaningful work update", changed_files=None):
    if changed_files is None:
        changed_files = []
        
    print("📝 Evaluating Write-Back...")
    
    if not changed_files:
        print("⏭️  No critical files changed. Skipping write-back.")
        return
        
    sessions_dir = PROJECT_BRAIN_DIR / "sessions"
    os.makedirs(sessions_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    session_file = sessions_dir / f"session-{timestamp}.md"
    
    content = f"""# Session: {timestamp}
- **Project:** {PROJECT_NAME}
- **Date:** {datetime.now().isoformat()}

## Summary
{task_summary}

## Files Modified
"""
    for f in changed_files:
        content += f"- `{f}`\n"
        
    try:
        with open(session_file, "w") as f:
            f.write(content)
        print(f"✅ Session write-back saved: {session_file}")
    except Exception as e:
        print(f"❌ Failed to write session: {e}")

if __name__ == "__main__":
    # Test execution
    changed = run_cmd("git diff --name-only HEAD").split('\n')
    changed = [f for f in changed if f]
    writeback_memory("Automated testing of writeback engine.", changed)
