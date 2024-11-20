import os
from pathlib import Path

# Import setuptools
from setuptools import setup, find_namespace_packages

# Get the directory containing setup.py
here = Path(__file__).parent.resolve()

# Read requirements from requirements.txt
try:
    with open(here / 'requirements.txt', encoding='utf-8') as f:
        required = [line for line in f.read().splitlines() if line and not line.startswith('#')]
except FileNotFoundError:
    required = [
        'google-generativeai==0.3.2',
        'python-dotenv==1.0.0',
        'pathlib==1.0.1',
        'requests==2.31.0',
    ]

# Read long description from README.md if it exists
try:
    with open(here / 'README.md', encoding='utf-8') as f:
        long_description = f.read()
except FileNotFoundError:
    long_description = ''

setup(
    name="codegen-ai",
    version="1.0.0",
    description="AI-powered code generation service",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Your Name",
    packages=find_namespace_packages(include=['server.*']),
    package_dir={"": "."},
    python_requires=">=3.8",
    install_requires=required,
    entry_points={
        "console_scripts": [
            "codegen=server.services.gemini:main",
        ],
    },
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
    ],
) 