"""
Supabase MCP Bridge Runner
Executes Supabase MCP operations via @supabase/mcp-server-postgrest.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

# Load environment variables if available
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

if ENV_FILE.exists():
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://vkjranivomjttumfsjhz.supabase.co")
API_URL = f"{SUPABASE_URL.rstrip('/')}/rest/v1"
API_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "")


def run_mcp_command(tool_name: str, arguments: dict):
    cmd = [
        "npx", "-y", "@supabase/mcp-server-postgrest",
        "--apiUrl", API_URL,
        "--schema", "public",
    ]
    if API_KEY:
        cmd.extend(["--apiKey", API_KEY])

    proc = subprocess.Popen(
        cmd,
        shell=True,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    try:
        # 1. Initialize
        init_req = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "crevo-mcp-client", "version": "1.0.0"},
            },
        }
        proc.stdin.write(json.dumps(init_req) + "\n")
        proc.stdin.flush()
        _ = proc.stdout.readline()

        # 2. Tool Call
        call_req = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": arguments},
        }
        proc.stdin.write(json.dumps(call_req) + "\n")
        proc.stdin.flush()
        response_line = proc.stdout.readline()
        data = json.loads(response_line)
        return data
    finally:
        proc.terminate()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python supabase_mcp.py <sql_query|endpoint_path>")
        print("Example: python supabase_mcp.py 'SELECT * FROM profiles'")
        print("Example: python supabase_mcp.py '/profiles'")
        sys.exit(1)

    arg = sys.argv[1]
    if arg.startswith("/"):
        res = run_mcp_command("postgrestRequest", {"method": "GET", "path": arg})
    else:
        res = run_mcp_command("sqlToRest", {"sql": arg})

    print(json.dumps(res, indent=2))
