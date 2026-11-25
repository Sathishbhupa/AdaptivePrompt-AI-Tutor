"""Offline release checks for AdaptivePrompt Tutor.

This script intentionally does not require API keys, Supabase credentials, or
Node dependencies. It catches packaging/configuration mistakes before a live
end-to-end test is attempted.
"""
from pathlib import Path
import ast
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
errors = []

required = [
    "frontend/app/layout.tsx",
    "frontend/app/tutor/page.tsx",
    "frontend/app/chat/page.tsx",
    "frontend/app/dashboard/page.tsx",
    "frontend/public/logo.png",
    "frontend/public/favicon.ico",
    "frontend/public/apple-touch-icon.png",
    "backend/app/main.py",
    "backend/app/auth.py",
    "backend/app/llm.py",
    "backend/app/prompts.py",
    "backend/data/tutor_benchmark.json",
]
for rel in required:
    if not (ROOT / rel).exists():
        errors.append(f"missing: {rel}")

# Never package secrets or dependency trees.
for path in ROOT.rglob("*"):
    if path.is_file() and (path.name in {".env", ".env.local"} or (path.name.startswith(".env.") and not path.name.endswith(".example"))):
        errors.append(f"secret file present: {path.relative_to(ROOT)}")
    if "node_modules" in path.parts:
        errors.append(f"node_modules present: {path.relative_to(ROOT)}")

# Parse all backend Python files without importing optional runtime packages.
for path in (ROOT / "backend" / "app").glob("*.py"):
    try:
        ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    except SyntaxError as exc:
        errors.append(f"python syntax: {path}: {exc}")

# Validate benchmark structure.
benchmark_path = ROOT / "backend/data/tutor_benchmark.json"
try:
    benchmark = json.loads(benchmark_path.read_text(encoding="utf-8"))
    if not isinstance(benchmark, list) or not benchmark:
        errors.append("benchmark must be a non-empty JSON array")
    for item in benchmark:
        for key in ("id", "question", "difficulty"):
            if key not in item:
                errors.append(f"benchmark item missing {key}")
except Exception as exc:
    errors.append(f"benchmark JSON invalid: {exc}")

# Ensure the Research UI was removed from navigation.
layout = (ROOT / "frontend/app/layout.tsx").read_text(encoding="utf-8")
if "/research" in layout or "Research" in layout:
    errors.append("Research UI still appears in primary navigation")

if errors:
    print("RELEASE CHECK: FAIL")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print("RELEASE CHECK: PASS")
print("- required application assets present")
print("- backend Python syntax valid")
print("- benchmark JSON valid")
print("- no .env secrets/node_modules in package tree")
print("- Research UI absent from primary navigation")
