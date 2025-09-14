import prisma from "../../../packages/db";
import fetch from "node-fetch";
import mustache from "mustache";

export default async function sendTelegramMessage(
  template: any,
  credentialId: string,
  prevContext: any,
) {
  const credentials = await prisma.credentials.findMany({
    where: { id: credentialId },
  });
  if (!credentials) {
    throw new Error("Telegram credential was not found");
  }
  const data = credentials[0].data as { botToken: string; chatId: string };
  const { botToken, chatId } = data;
  if (!botToken || !chatId) {
    throw new Error("Telegram credentials are needed");
  }
  const msg = mustache.render(template.message, prevContext);
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        chat_Id: chatId,
        text: msg,
      }),
    },
  );
  const message = await response.text();
  console.log("Message sent is: ", message);
  return { msg };
}
