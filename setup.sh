#!/bin/bash

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Create necessary directories
mkdir -p client/public/uploads
mkdir -p logs

# Set up environment variables
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Please update the .env file with your credentials"
fi

echo "Setup complete! Don't forget to:"
echo "1. Update your .env file with proper credentials"
echo "2. Run 'source venv/bin/activate' to activate the Python environment"
echo "3. Run 'npm run dev' to start the development server" 