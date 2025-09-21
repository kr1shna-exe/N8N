import { getAuthToken } from "./credentials";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const workflowService = {
  async getWorkflowById(workflowId: string) {
    try {
      const response = await fetch(`${API_URL}/api/workflow/${workflowId}`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error occured while getting workflow: ", error);
    }
  },
};
