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
    chatId?: string;
  };
  userId: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getAuthToken = () => {
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
    const response = await fetch(
      `${API_URL}/api/user/credentials/${credentialId}`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
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

  getCredentialsByPlatform: async (platform: string) => {
    const response = await fetch(
      `${API_URL}/api/user/credentials/${platform}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return handleResponse(response);
  },
};

export const mapToBackendCredential = (frontendData: {
  name: string;
  service: { id: string; name: string; api: string; icon: string };
  accessToken: string;
  chatId?: string;
  baseUrl?: string;
}): credentialsSchema => {
  let platform: Platform;

  switch (frontendData.service.id.toLowerCase()) {
    case "telegram":
      platform = Platform.Telegram;
      break;
    case "resendemail":
    case "resend":
    case "email":
      platform = Platform.ResendEmail;
      break;
    case "gemini":
      platform = Platform.Gemini;
      break;
    case "groq":
      platform = Platform.Groq;
      break;
    default:
      throw new Error(`Unsupported platform: ${frontendData.service.id}`);
  }

  if (platform === Platform.Telegram) {
    return {
      title: frontendData.name,
      platform,
      data: {
        apiKey: frontendData.accessToken,
        chatId: frontendData.chatId || "",
      },
    };
  } else {
    return {
      title: frontendData.name,
      platform,
      data: {
        apiKey: frontendData.accessToken,
      },
    };
  }
};

export const mapFromBackendCredential = (backendCredential: Credential) => {
  const getIconForPlatform = (platform: Platform): string => {
    switch (platform.toUpperCase()) {
      case "TELEGRAM":
        return "📱";
      case "RESENDEMAIL":
        return "📧";
      case "GEMINI":
        return "🤖";
      case "GROQ":
        return "⚡";
      default:
        return "🔧";
    }
  };

  return {
    id: backendCredential.id,
    name: backendCredential.title,
    service: {
      id: backendCredential.platform.toLowerCase(),
      name: backendCredential.platform,
      api: `${backendCredential.platform} API`,
      icon: getIconForPlatform(backendCredential.platform),
    },
    accessToken: backendCredential.data.apiKey,
    chatId:
      backendCredential.platform === Platform.Telegram
        ? backendCredential.data.chatId
        : undefined,
    baseUrl: getBaseUrlForPlatform(backendCredential.platform),
  };
};

const getBaseUrlForPlatform = (platform: Platform): string => {
  switch (platform) {
    case Platform.Telegram:
      return "https://api.telegram.org";
    case Platform.ResendEmail:
      return "https://api.resend.com";
    case Platform.Gemini:
      return "https://generativelanguage.googleapis.com";
    case Platform.Groq:
      return "https://api.groq.com";
    default:
      return `https://api.${platform}.com`;
  }
};
