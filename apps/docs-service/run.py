#!/usr/bin/env python3
"""
Simple runner for the documentation service.
"""

import sys
import os

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Add the packages directory to Python path
packages_dir = os.path.join(project_root, "packages")
sys.path.insert(0, packages_dir)

# Add the app directory to Python path
app_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, app_dir)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8084, reload=True)
