import { getAuthToken } from "./credentials";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const workflowService = {
  async getWorkflowById(workflowId: string) {
    try {
      const response = await fetch(`${API_URL}/api/workflows/${workflowId}`, {
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
  async saveWorkflow(workflowData: any) {
    try {
      const response = await fetch(`${API_URL}/api/workflows`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowData),
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error while saving workflow: ", error);
    }
  },
  async getWorkflows() {
    try {
      const response = await fetch(`${API_URL}/api/workflows`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error while fetchign workflows: ", error);
    }
  },
  async updateWorkflow(workflowId: string, workflowData: any) {
    try {
      const response = await fetch(`${API_URL}/api/workflows/${workflowId}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowData),
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error while updating workflows");
    }
  },

  async deleteWorkflow(workflowId: string) {
    try {
      const response = await fetch(`${API_URL}/api/workflows/${workflowId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.log("Error while deleting workflow:", error);
      throw error;
    }
  },
};
