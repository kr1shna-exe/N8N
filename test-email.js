const sendEmail = require("./apps/workers/nodes/resendEmail.ts").default;

async function testEmail() {
  try {
    console.log("Testing Email node...");

    const result = await sendEmail(
      {
        to: "youremail@gmail.com",
        subject: "Test from workflow",
        body: "<p>Hello {{name}}, sent at {{time}}</p>",
      },
      "1e6addc8-9f6f-49d0-9d0e-ece71cc4ee7a",
      {
        name: "Test User",
        time: new Date().toLocaleTimeString(),
      }
    );

    console.log("Email test successful:", result);
  } catch (error) {
    console.error("Email test failed:", error);
  }
}

testEmail();
