const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface NodeType {
  type: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  file_path?: string;
}

export interface NodesResponse {
  nodes: NodeType[];
  total: number;
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const nodeService = {
  async getAvailableNodes(): Promise<NodesResponse> {
    try {
      const response = await fetch(`${API_URL}/api/nodes/types`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch available nodes:", error);
      throw error;
    }
  },
};
