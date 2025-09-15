import { getFromQueue, addToQueue } from "../server/redis/index";
import { runNode } from "./nodes/runNodes/runner";
import prisma from "../../packages/db";

const processJobs = async (): Promise<void> => {
  console.log("Worker started, listening for jobs...");
  
  while (true) {
    try {
      const job = await getFromQueue(5);
      if (!job) continue;
      
      console.log(`Processing job: ${job.id} (node: ${job.data.nodeId})`);
      const nodeResult = await runNode(
        {
          type: job.type === 'telegram' ? 'Telegram' : 'ResendEmail',
          template: job.data.nodeData,
          credentialId: job.data.credentialId
        },
        job.data.context
      );
      await updateExecutionProgress(
        job.data.executionId,
        job.data.nodeId,
        nodeResult
      );
      const workflow = await prisma.workflow.findUnique({
        where: { id: job.data.workflowId }
      });
      
      if (workflow && job.data.connections.length > 0) {
        const nodes = workflow.nodes as Record<string, any>;
        const updatedContext = { ...job.data.context, ...nodeResult };
        for (const nextNodeId of job.data.connections) {
          const nextNodeData = nodes[nextNodeId];
          if (nextNodeData) {
            const connections = (workflow.connections as Record<string, string[]>);
            await addToQueue({
              id: `${nextNodeId}-${job.data.executionId}`,
              type: nextNodeData.type.toLowerCase(),
              data: {
                ...job.data,
                nodeId: nextNodeId,
                nodeData: nextNodeData,
                credentialId: nextNodeData.credentials,
                context: updatedContext,
                connections: connections[nextNodeId] || []
              }
            });
          }
        }
      }
      
    } catch (error) {
      console.error("Error processing job:", error);
    }
  }
};

const updateExecutionProgress = async (
  executionId: string, 
  nodeId: string, 
  nodeResult: any
) => {
  try {
    const execution = await prisma.execution.findUnique({
      where: { id: executionId }
    });
    
    if (!execution) return;
    
    const currentResult = execution.result as any || { nodeResults: {} };
    const newTasksDone = execution.tasksDone + 1;
    const isComplete = newTasksDone >= (execution.totalTasks || 0);
    
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        tasksDone: newTasksDone,
        status: isComplete,
        result: {
          ...currentResult,
          nodeResults: {
            ...currentResult.nodeResults,
            [nodeId]: {
              result: nodeResult,
              completedAt: new Date().toISOString()
            }
          },
          ...(isComplete && { completedAt: new Date().toISOString() })
        }
      }
    });
    
    console.log(`Execution ${executionId}: ${newTasksDone}/${execution.totalTasks} tasks completed`);
    
  } catch (error) {
    console.error("Error updating execution progress:", error);
  }
};

processJobs();