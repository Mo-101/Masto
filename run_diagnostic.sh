#!/bin/bash

echo "🛡️ SOVEREIGN GRID DIAGNOSTIC UTILITY"
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if the diagnostic script exists
if [ ! -f "sovereign_diagnostic.py" ]; then
    echo "❌ sovereign_diagnostic.py not found. Please make sure you're in the correct directory."
    exit 1
fi

# Make the script executable
chmod +x sovereign_diagnostic.py

# Run the diagnostic
echo "🚀 Running Sovereign Grid Diagnostic..."
python3 sovereign_diagnostic.py

# Check if the diagnostic was successful
if [ $? -ne 0 ]; then
    echo "❌ Diagnostic failed. Please check the error messages above."
    exit 1
fi

echo "✅ Diagnostic complete."
