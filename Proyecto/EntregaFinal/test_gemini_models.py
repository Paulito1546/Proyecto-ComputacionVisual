"""
test_gemini_models.py - Enhanced test script with better error handling

Run this to diagnose Gemini API issues.
"""

import sys
import os

print("=" * 80)
print("GEMINI API DIAGNOSTIC TOOL")
print("=" * 80 + "\n")

# Step 1: Check Python version
print(f"✓ Python version: {sys.version}")

# Step 2: Check if dotenv is installed
try:
    from dotenv import load_dotenv

    print("✓ python-dotenv is installed")
except ImportError:
    print("❌ python-dotenv is NOT installed")
    print("   Install it: pip install python-dotenv")
    sys.exit(1)

# Step 3: Check if google-generativeai is installed
try:
    import google.generativeai as genai

    print(f"✓ google-generativeai is installed")

    # Try to get version
    try:
        import importlib.metadata

        version = importlib.metadata.version("google-generativeai")
        print(f"  Version: {version}")
    except:
        print("  Version: Unknown")
except ImportError as e:
    print(f"❌ google-generativeai is NOT installed: {e}")
    print("   Install it: pip install google-generativeai")
    sys.exit(1)

# Step 4: Check for .env file
print("\n" + "-" * 80)
print("CHECKING ENVIRONMENT")
print("-" * 80)

if os.path.exists(".env"):
    print("✓ .env file exists")
    load_dotenv()
else:
    print("⚠️  .env file NOT found in current directory")
    print(f"   Current directory: {os.getcwd()}")

# Step 5: Check for API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ GEMINI_API_KEY not found in environment")
    print("\nPlease create a .env file with:")
    print("   GEMINI_API_KEY=your_api_key_here")
    print("\nOr set it in your environment:")
    print("   export GEMINI_API_KEY=your_api_key_here")
    sys.exit(1)
else:
    print(f"✓ GEMINI_API_KEY found")
    print(f"  Length: {len(api_key)} characters")
    print(f"  First 10 chars: {api_key[:10]}...")
    print(f"  Last 4 chars: ...{api_key[-4:]}")

# Step 6: Try to configure API
print("\n" + "-" * 80)
print("CONFIGURING API")
print("-" * 80)

try:
    genai.configure(api_key=api_key)
    print("✓ API configured successfully")
except Exception as e:
    print(f"❌ Failed to configure API: {e}")
    sys.exit(1)

# Step 7: Try to list models
print("\n" + "-" * 80)
print("LISTING AVAILABLE MODELS")
print("-" * 80 + "\n")

try:
    models = list(genai.list_models())
    print(f"✓ Found {len(models)} models\n")

    if len(models) == 0:
        print("⚠️  No models returned - this might indicate:")
        print("   1. API key is invalid or expired")
        print("   2. API key doesn't have proper permissions")
        print("   3. Network/firewall issue")
        sys.exit(1)

    generation_models = []

    for i, model in enumerate(models, 1):
        print(f"{i}. {model.name}")
        print(f"   Display: {model.display_name}")
        print(f"   Methods: {', '.join(model.supported_generation_methods)}")

        if "generateContent" in model.supported_generation_methods:
            generation_models.append(model.name)
            print(f"   ✓ Supports generateContent")

        print()

    # Step 8: Recommend a model
    if generation_models:
        print("=" * 80)
        print("RECOMMENDATION")
        print("=" * 80 + "\n")

        # Prefer flash models
        flash_models = [m for m in generation_models if "flash" in m.lower()]

        if flash_models:
            recommended = flash_models[0]
        else:
            recommended = generation_models[0]

        print(f"Use this model: {recommended}")
        print(f"\nUpdate gemini_analyzer.py line 52:")
        print(f'self.model = genai.GenerativeModel("{recommended}")')

        # Test the model
        print("\n" + "-" * 80)
        print("TESTING MODEL")
        print("-" * 80)

        try:
            test_model = genai.GenerativeModel(recommended)
            print(f"✓ Model '{recommended}' loaded successfully")

            print("\nTrying a simple generation...")
            response = test_model.generate_content("Say 'Hello, I am working!'")
            print(f"✓ Generation successful!")
            print(f"  Response: {response.text[:100]}...")

        except Exception as e:
            print(f"❌ Model test failed: {e}")
    else:
        print("⚠️  No models support generateContent")
        print("This is unusual - check your API key permissions")

except Exception as e:
    print(f"❌ Error listing models: {e}")
    print(f"\nFull error details:")
    import traceback

    traceback.print_exc()
    print("\nThis might mean:")
    print("1. Network connectivity issue")
    print("2. API key is invalid")
    print("3. API service is down")
    print("4. Firewall blocking the request")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)
