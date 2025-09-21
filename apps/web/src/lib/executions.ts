import { getAuthToken } from "./credentials";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const executionService = {
  async getExecutions() {
    try {
      const response = await fetch(`${API_URL}/api/executions`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error occured while getting executions: ", error);
    }
  },

  async getExecutionById(executionId: string) {
    try {
      const response = await fetch(`${API_URL}/api/executions/${executionId}`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error occured while getting execution: ", error);
    }
  },

  async resumeWorkflow(executionId: string, data: any) {
    try {
      const response = await fetch(
        `${API_URL}/api/executions/${executionId}/resume`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${getAuthToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    } catch (error) {
      console.log("Error while resuming the workflow: ", error);
    }
  },
};
