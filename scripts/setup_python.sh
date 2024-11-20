#!/bin/bash

# Exit on error
set -e

# Function to check Python version
check_python_version() {
    local required_major=3
    local required_minor=8
    
    if command -v python3 >/dev/null 2>&1; then
        local version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        local major=$(echo $version | cut -d. -f1)
        local minor=$(echo $version | cut -d. -f2)
        
        if [ "$major" -ge $required_major ] && [ "$minor" -ge $required_minor ]; then
            return 0
        fi
    fi
    return 1
}

# Check Python version
if ! check_python_version; then
    echo "Error: Python 3.8 or higher is required"
    exit 1
fi

# Create and activate virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Source virtual environment
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install development dependencies
echo "Installing development dependencies..."
pip install setuptools wheel build

# Install project in development mode
echo "Installing project in development mode..."
pip install -e .

# Test the installation
echo "Testing installation..."
python -c "import google.generativeai as genai; print(f'google-generativeai version: {genai.__version__}')"

echo "Python setup complete! Virtual environment is activated."
echo "Run 'deactivate' to exit the virtual environment." 