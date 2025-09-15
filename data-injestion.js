const { PrismaClient } = require("./packages/db/generated/prisma");
const prisma = new PrismaClient();

async function createTestWorkflow() {
  try {
    console.log("Creating test workflow...");

    const workflow = await prisma.workflow.create({
      data: {
        id: "telegram-email-workflow-123",
        userId: "generated_user_id",
        title: "Telegram to Email Test Workflow",
        enabled: true,
        triggerType: "Manual",
        nodes: {
          "telegram-node": {
            type: "Telegram",
            credentials: "credential_id",
            template: {
              message:
                "Workflow started! User: {{name}} | Email: {{email}} | Time: {{timestamp}}",
            },
          },
          "email-node": {
            type: "ResendEmail",
            credentials: "credential_id",
            template: {
              to: "{{email}}",
              subject: "Workflow Completed for {{name}}",
              body: "<h2>Hello {{name}}!</h2><p>Your workflow completed successfully.</p><p>Started at: {{timestamp}}</p>",
            },
          },
        },
        connections: {
          "telegram-node": ["email-node"],
          "email-node": [],
        },
      },
    });

    console.log("Test workflow created:", workflow.id);
  } catch (error) {
    console.error("Error creating workflow:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestWorkflow();
