const sendTelegramMessage = require("./apps/workers/nodes/telegram.ts").default;

async function testTelegram() {
  try {
    console.log("Testing Telegram node...");

    const result = await sendTelegramMessage(
      { message: "Hello from test! This is {{name}} at {{time}}" },
      "cred_id",
      {
        name: "Test User",
        time: new Date().toLocaleTimeString(),
      }
    );

    console.log("Telegram test successful:", result);
  } catch (error) {
    console.error("Telegram test failed:", error);
  }
}

testTelegram();
