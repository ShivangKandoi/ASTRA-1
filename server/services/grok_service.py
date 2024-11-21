import os
import requests
import sys
import json
from dotenv import load_dotenv

# X.AI API configuration
API_URL = "https://api.x.ai/v1/chat/completions"

def get_language_from_filename(filename):
    """Detect programming language from file extension"""
    if not filename:
        return "python"  # default
    
    ext = filename.lower().split('.')[-1]
    language_map = {
        'py': 'python',
        'js': 'javascript',
        'java': 'java',
        'cpp': 'c++',
        'c': 'c',
        'html': 'html',
        'css': 'css',
        'rb': 'ruby',
        'php': 'php',
        'go': 'golang',
    }
    return language_map.get(ext, 'python')

def create_prompt(description, filename=None):
    """Create a language-specific prompt for code generation"""
    language = get_language_from_filename(filename)
    
    language_specific_instructions = {
        'python': "Generate Python code. Use Python-specific syntax and conventions.",
        'javascript': "Generate JavaScript code. Use modern ES6+ syntax and conventions.",
        'java': "Generate Java code. Include class definition and proper Java syntax.",
        'c++': "Generate C++ code. Include necessary headers and proper C++ syntax.",
        'c': "Generate C code. Include necessary headers and proper C syntax.",
        'html': "Generate HTML code. Use semantic HTML5 elements.",
        'css': "Generate CSS code. Use modern CSS conventions.",
        'ruby': "Generate Ruby code. Use Ruby-specific syntax and conventions.",
        'php': "Generate PHP code. Include proper PHP tags and syntax.",
        'golang': "Generate Go code. Follow Go conventions and proper syntax."
    }

    instruction = language_specific_instructions.get(language, "Generate code in the appropriate language.")
    
    return [
        {
            "role": "system",
            "content": f"You are a code generator specialized in {language} programming. {instruction} Generate only the code without any explanations, comments, or markdown formatting. The code should be clean, efficient, and ready to run."
        },
        {
            "role": "user",
            "content": f"Generate {language} code for: {description}"
        }
    ]

def generate_code(description, api_key, action="generate", filename=None):
    try:
        if not api_key:
            raise ValueError("API key is required")

        messages = create_prompt(description, filename)
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "messages": messages,
            "model": "grok-beta",
            "stream": False,
            "temperature": 0.1,
            "max_tokens": 2000
        }

        response = requests.post(API_URL, headers=headers, json=data, timeout=30)
        
        if response.status_code != 200:
            raise Exception(f"API Error: {response.status_code}")
            
        response_data = response.json()
        code = response_data['choices'][0]['message']['content'].strip()

        # Remove any markdown formatting if present
        if code.startswith("```") and code.endswith("```"):
            code = "\n".join(code.split("\n")[1:-1])

        print(json.dumps({
            "success": True,
            "code": code,
            "language": get_language_from_filename(filename)
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

def main():
    if len(sys.argv) <= 1:
        print(json.dumps({
            "success": False,
            "error": "No input provided"
        }))
        return

    try:
        input_data = json.loads(sys.argv[1])
        generate_code(
            input_data.get("description", ""),
            input_data.get("api_key", ""),
            input_data.get("action", "generate"),
            input_data.get("filename", "")  # Add filename parameter
        )
    except json.JSONDecodeError:
        print(json.dumps({
            "success": False,
            "error": "Invalid JSON input"
        }))

if __name__ == "__main__":
    main()
