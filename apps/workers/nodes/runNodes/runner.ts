import sendTelegramMessage from "../telegram";
import sendEmail from "../resendEmail";

export async function runNode(node: any, Context: Record<string, any>) {
  try {
    switch (node.type) {
      case "ResendEmail":
        return await sendEmail(node.template, node.credentialId, Context);
      case "Telegram":
        return await sendTelegramMessage(
          node.template,
          node.credentialId,
          Context,
        );
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  } catch (error) {
    console.log("Unkown error while running node:", error);
  }
}
