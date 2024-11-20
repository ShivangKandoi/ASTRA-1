import os
import requests
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Grok API configuration
GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GROK_API_KEY = os.getenv('GROK_API_KEY')

def generate_code(description, action="generate"):
    """
    Generate code using the Grok API and return it as plain text.
    """
    try:
        # Construct the prompt based on the action
        if action == "generate":
            prompt = f"Write code for the following: {description}"
        elif action == "debug":
            prompt = f"Debug and fix the following code: {description}"
        elif action == "refactor":
            prompt = f"Refactor this code for better readability and performance: {description}"
        else:
            raise ValueError("Invalid action specified. Must be 'generate', 'debug', or 'refactor'.")

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert programmer. Respond with only the raw code string. "
                    "Do not include markdown formatting, JSON, or explanations."
                )
            },
            {"role": "user", "content": prompt}
        ]

        # Prepare the request for Grok API
        headers = {
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "messages": messages,
            "model": "grok-beta",
            "temperature": 0.3,
            "max_tokens": 4000
        }

        # Send request to the API
        response = requests.post(GROK_API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        response_data = response.json()

        # Extract the code from the response
        code = response_data['choices'][0]['message']['content'].strip()

        # Remove any markdown formatting (e.g., triple backticks)
        if code.startswith("```"):
            lines = code.split("\n")
            code = "\n".join(lines[1:-1])

        # Wrap the raw code in a JSON response
        result = {
            "success": True,
            "code": code
        }
        print(json.dumps(result))

    except Exception as e:
        # Print the error message in JSON format
        result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(result))

def main():
    """
    Main function for CLI usage.
    """
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            description = input_data.get("description", "")
            action = input_data.get("action", "generate")
            generate_code(description, action)
        except json.JSONDecodeError:
            print(json.dumps({"success": False, "error": "Invalid JSON input"}))
    else:
        # Example usage
        generate_code("print hello world in Python")

if __name__ == "__main__":
    main()
