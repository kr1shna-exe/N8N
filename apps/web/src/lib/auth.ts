import {
  SigninSchema,
  SignupSchema,
  type signInSchema,
  type signUpSchema,
} from "../../../../packages/exports";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export interface AuthUser {
  id: string;
  email: string;
  token?: string;
}

export const authApi = {
  signup: async (userData: signUpSchema): Promise<AuthUser> => {
    const validateRequest = SignupSchema.safeParse(userData);
    if (!validateRequest.success) {
      throw new Error(
        `Validation failed: ${validateRequest.error.issues.map((e) => e.message).join(", ")}`
      );
    }
    console.log("Ateempting from submit form");
    const response = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateRequest.data),
      credentials: "include",
    });

    return handleResponse(response);
  },

  signin: async (userData: signInSchema): Promise<AuthUser> => {
    const validateRequest = SigninSchema.safeParse(userData);
    if (!validateRequest.success) {
      throw new Error(
        `Validation failed: ${validateRequest.error.issues.map((e) => e.message).join(", ")}`
      );
    }

    const response = await fetch(`${API_URL}/user/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateRequest.data),
      credentials: "include",
    });

    const result = await handleResponse(response);
    if (result.access_token) {
      localStorage.setItem("authToken", result.access_token);
    }

    return {
      id: result.user?.id || "",
      email: result.user?.email || "",
      token: result.access_token,
    };
  },

  signout: async (): Promise<void> => {
    localStorage.removeItem("authToken");
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/user/verify-token`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        localStorage.removeItem("authToken");
        return null;
      }

      const result = await response.json();

      if (result.success && result.user) {
        return {
          id: result.user.id,
          email: result.user.email,
          token,
        };
      } else {
        localStorage.removeItem("authToken");
        return null;
      }
    } catch {
      localStorage.removeItem("authToken");
      return null;
    }
  },
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },
};
