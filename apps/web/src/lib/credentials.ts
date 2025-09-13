import {
  credentialsSchema,
  credentialsUpdateSchema,
  Platform,
  updatedCredentialSchema,
} from "../../../../packages/exports";

type Credential = {
  id: string;
  title: string;
  platform: Platform;
  data: {
    apiKey: string;
  };
  userId: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthToken = () => {
  return localStorage.getItem("authToken") || "";
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const credentialsApi = {
  getCredentials: async () => {
    const response = await fetch(`${API_URL}/api/user/credentials`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });
    return handleResponse(response);
  },

  createCredentials: async (credentialData: credentialsSchema) => {
    const validateRequest = credentialsSchema.safeParse(credentialData);
    if (!validateRequest.success) {
      throw new Error("Validation failed");
    }
    const response = await fetch(`${API_URL}/api/user/credentials`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateRequest.data),
    });
    return handleResponse(response);
  },

  deleteCredentials: async (credentialId: string) => {
    const response = await fetch(`${API_URL}/api/user/delete/${credentialId}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });
    return handleResponse(response);
  },

  updateCredentials: async (
    credentialData: updatedCredentialSchema,
    credentialId: string
  ) => {
    const validateRequest = credentialsUpdateSchema.safeParse(credentialData);
    if (!validateRequest.success) {
      throw new Error("Validation failed");
    }
    const response = await fetch(
      `${API_URL}/api/user/credentials/${credentialId}`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validateRequest.data),
      }
    );
    return handleResponse(response);
  },
};

export const mapToBackendCredential = (frontendData: {
  name: string;
  service: { id: string; name: string; api: string; icon: string };
  accessToken: string;
  baseUrl?: string;
}): credentialsSchema => {
  const platform =
    frontendData.service.id === "telegram"
      ? Platform.Telegram
      : Platform.ResendEmail;

  return {
    title: frontendData.name,
    platform,
    data: {
      apiKey: frontendData.accessToken,
    },
  };
};

export const mapFromBackendCredential = (backendCredential: Credential) => {
  return {
    id: backendCredential.id,
    name: backendCredential.title,
    service: {
      id: backendCredential.platform.toLowerCase(),
      name: backendCredential.platform,
      api: `${backendCredential.platform} API`,
      icon: backendCredential.platform === Platform.Telegram ? "📱" : "��",
    },
    accessToken: backendCredential.data.apiKey,
    baseUrl:
      backendCredential.platform === Platform.Telegram
        ? "https://api.telegram.org"
        : `https://api.${backendCredential.platform.toLowerCase()}.com`,
  };
};
