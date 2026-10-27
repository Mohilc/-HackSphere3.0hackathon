"""
HackSphere 3.0 — Catalyst AppSail Packaging Script
Creates a clean, production-ready deploy.zip bundle for upload
directly into the Zoho Catalyst Web Console.
"""

import os
import zipfile
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
OUTPUT_ZIP = ROOT / "catalyst_deploy.zip"

INCLUDE_FILES = [
    "server.py",
    "model.py",
    "transition.py",
    "ai_advisor.py",
    "trained_model.pkl",
    "requirements.txt",
    "app-config.json",
    "catalyst.json",
    "Procfile",
    "README.md",
]

INCLUDE_DIRS = [
    "HackSphere_Starter_Kit",
    os.path.join("client", "dist"),
]


def ensure_frontend_built():
    dist_dir = ROOT / "client" / "dist"
    if not dist_dir.exists() or not any(dist_dir.iterdir()):
        print("[Packager] client/dist missing. Running build...")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        subprocess.run([npm_cmd, "--prefix", "client", "run", "build"], cwd=ROOT, check=True, shell=(os.name == "nt"))
    else:
        print("[Packager] Found existing client/dist build.")


def package():
    ensure_frontend_built()

    if OUTPUT_ZIP.exists():
        OUTPUT_ZIP.unlink()

    print(f"[Packager] Generating {OUTPUT_ZIP.name}...")
    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        # Add single files
        for fname in INCLUDE_FILES:
            fpath = ROOT / fname
            if fpath.exists():
                z.write(fpath, arcname=fname)
                print(f"  + Added file: {fname}")

        # Add directories
        for dname in INCLUDE_DIRS:
            dpath = ROOT / dname
            if dpath.exists():
                for root, _, files in os.walk(dpath):
                    for file in files:
                        full_path = Path(root) / file
                        rel_path = full_path.relative_to(ROOT)
                        z.write(full_path, arcname=str(rel_path))
                print(f"  + Added directory: {dname}/")

    size_mb = OUTPUT_ZIP.stat().st_size / (1024 * 1024)
    print(f"\n[Packager] Successfully created {OUTPUT_ZIP.name} ({size_mb:.2f} MB)")
    print(f"[Packager] Location: {OUTPUT_ZIP}")


if __name__ == "__main__":
    package()
