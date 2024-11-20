#!/bin/bash

# Check if Python 3.8+ is installed
python3 --version >/dev/null 2>&1 || { echo "Python 3.8+ is required but not installed. Aborting." >&2; exit 1; }

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Test Gemini API
echo "Testing Gemini API integration..."
python3 server/services/gemini.py

echo "Python setup complete!" 