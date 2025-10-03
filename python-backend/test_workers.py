import asyncio
import os
import sys


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from Workers.nodes.runNode.runner import runNode


async def test_email():
    """Test email functionality"""
    node = {
        "type": "ResendEmail",
        "template": {
            "to": "youremail@gmail.com",
            "subject": "Test Subject - {{name}}",
            "body": "Hello {{name}}, this is a test email!",
        },
        "credentialId": "your_cred_id",
    }

    context = {"name": "John Doe"}

    try:
        result = await runNode(node, context)
        print(" Email test successful:", result)
    except Exception as e:
        print("Email test failed:", str(e))


async def test_telegram():
    """Test telegram functionality"""
    node = {
        "type": "Telegram",
        "template": {
            "message": "Hello {{name}}! This is a test message."
        },
        "credentialId": "your_cred_id"
    }

    context = {
        "name": "Jane Doe"
    }

    try:
        result = await runNode(node, context)
        print("Telegram test successful:", result)
    except Exception as e:
        print("Telegram test failed:", str(e))


async def main():
    print("Testing Python Workers...")
    await test_email()
    await test_telegram()


if __name__ == "__main__":
    asyncio.run(main())

