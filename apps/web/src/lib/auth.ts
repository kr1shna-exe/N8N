import {
  SigninSchema,
  SignupSchema,
  type signInSchema,
  type signUpSchema,
} from "../../../../packages/exports";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  // Sign up a new user
  signup: async (userData: signUpSchema): Promise<AuthUser> => {
    const validateRequest = SignupSchema.safeParse(userData);
    if (!validateRequest.success) {
      throw new Error(
        `Validation failed: ${validateRequest.error.issues.map((e) => e.message).join(", ")}`
      );
    }
    console.log("Ateempting from submit form");
    const response = await fetch(`${API_URL}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateRequest.data),
      credentials: "include", // Include cookies
    });

    return handleResponse(response);
  },

  // Sign in an existing user
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
      credentials: "include", // Include cookies
    });

    const result = await handleResponse(response);

    // Store token in localStorage if provided
    if (result.token) {
      localStorage.setItem("authToken", result.token);
    }

    return result;
  },

  // Sign out user
  signout: async (): Promise<void> => {
    localStorage.removeItem("authToken");
    // Clear any cookies by making a request (you might want to add a signout endpoint)
    try {
      await fetch(`${API_URL}/user/signout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors on signout
    }
  },

  // Get current user (if authenticated)
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      // Use the secure verify endpoint
      const response = await fetch(`${API_URL}/user/verify`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Token is invalid or expired
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

  // Check if user is authenticated (basic token existence check)
  // Note: This only checks if token exists, full validation happens in getCurrentUser
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },
};
