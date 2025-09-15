const sendTelegramMessage = require("./apps/workers/nodes/telegram.ts").default;

async function testTelegram() {
  try {
    console.log("Testing Telegram node...");

    const result = await sendTelegramMessage(
      { message: "Hello from test! This is {{name}} at {{time}}" },
      "7a05136d-f560-4c57-a00b-774263ed3295",
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
