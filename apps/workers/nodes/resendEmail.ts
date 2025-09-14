import { Resend } from "resend";
import Mustache from "mustache";
import prisma from "../../../packages/db";

export default async function sendEmail(
  template: any,
  credentialId: string,
  Context: any,
) {
  try {
    const credentials = await prisma.credentials.findMany({
      where: { id: credentialId },
    });
    if (!credentials) {
      throw new Error("Email credential was not found");
    }
    const data = credentials[0].data as { apiKey: string };
    if (!data.apiKey) {
      throw new Error("Email api key was not found");
    }
    const resend = new Resend(data.apiKey);
    const to = Mustache.render(template.to, Context);
    const subject = Mustache.render(template.subject, Context);
    const body = Mustache.render(template.body, Context);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html: body,
    });
    return { to, subject, body };
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
}
