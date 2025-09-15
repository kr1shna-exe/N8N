async function testWorkflow() {
  try {
    console.log("Testing full Telegram → Email workflow...");

    const response = await fetch(
      "http://localhost:3000/api/workflow/execute/telegram-email-workflow-123",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test User",
          email: "youremail@gmail.com",
          timestamp: new Date().toLocaleString(),
        }),
      }
    );

    const result = await response.json();
    console.log("Workflow triggered successfully!");
    console.log("Response:", result);
    console.log("Watch the terminal logs for execution progress...");
    console.log("Check your Telegram for the first message");
    console.log("Check your email for the second message");
  } catch (error) {
    console.error("Workflow test failed:", error);
  }
}

testWorkflow();
