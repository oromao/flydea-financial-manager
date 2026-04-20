#!/usr/bin/env python3
import sys
import subprocess

def run_script(script_name):
    try:
        print(f"🚀 Running {script_name}...")
        # using the current interpreter to run the scripts
        subprocess.check_call([sys.executable, f".agent/scripts/{script_name}"])
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running {script_name}: {e}")

def main():
    print("=== Second Brain OS: Production Mode ===")
    
    # 1. DISCOVER & PRIORITIZE FILES
    run_script("prioritize_files.py")
    
    # 2. RANK CONTEXT
    run_script("rank_context.py")
    
    # 3. WRITE-BACK
    # Note: LOAD and ACT are logical steps executed by the agent/developer.
    # Write-back captures the end-of-cycle state based on git diff.
    run_script("writeback_engine.py")
    
    # 4. SNAPSHOT (Git Memory)
    run_script("git_memory.py")
    
    print("\n✅ Production Mode cycle completed successfully.")

if __name__ == "__main__":
    main()
