import asyncio
import aiohttp
import json

async def test_workflow():
    print("Testing full Telegram → Email workflow with Python backend...")
    
    url = "http://localhost:8000/api/workflow/206cea41-8d46-48b0-ae6c-1ac46793619b"
    
    payload = {
        "name": "Test User",
        "email": "jkchinnu444444@gmail.com",
        "timestamp": "Python Test: " + str(asyncio.get_event_loop().time())
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    print("Workflow triggered successfully!")
                    print("Response:", json.dumps(result, indent=2))
                    print("Watch the terminal logs for execution progress...")
                    print("Check your Telegram for the first message")
                    print("Check your email for the second message")
                else:
                    print(f"Error: {response.status}")
                    print(await response.text())
    except Exception as e:
        print(f"Workflow test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_workflow())