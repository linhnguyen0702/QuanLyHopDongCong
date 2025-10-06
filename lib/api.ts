// API configuration and utilities
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      fullName: string;
      email: string;
      company: string;
      role: string;
    };
  };
  message?: string;
  errors?: Array<{
    msg?: string;
    message?: string;
    param?: string;
    value?: any;
    location?: string;
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth token management
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);

  // Also set cookie for middleware
  document.cookie = `auth_token=${token}; path=/; max-age=${
    24 * 60 * 60
  }; SameSite=Strict`;
};

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");

  // Also remove cookie
  document.cookie =
    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

// API client with authentication
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = getAuthToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server returned non-JSON response. Status: ${response.status}`
        );
      }

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        data = { success: false, message: "Invalid JSON response from server" };
      }

      // Log all response details for debugging
      console.log("API Response:", {
        url: `${this.baseURL}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data,
        hasContent: Object.keys(data).length > 0,
      });

      if (!response.ok) {
        // Handle empty response objects
        if (!data || Object.keys(data).length === 0) {
          data = {
            success: false,
            message: `Server error ${response.status}: ${response.statusText}`,
            data: null,
          };
        }

        // Log detailed error information for debugging
        const errorInfo = {
          url: `${this.baseURL}${endpoint}`,
          status: response.status,
          statusText: response.statusText,
          data: data,
          method: options.method || "GET",
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 10)}...` : "No token",
          isEmpty: Object.keys(data || {}).length === 0,
          responseMessage: data?.message || "No message provided",
        };

        if (response.status === 401) {
          console.warn("Authentication Error:", errorInfo);
        } else if (response.status === 403) {
          console.warn("Authorization Error (Forbidden):", errorInfo);
        } else if (response.status === 404) {
          console.warn("API Route not found:", errorInfo);
        }

        if (response.status === 401) {
          console.warn(
            "Authentication failed for:",
            `${this.baseURL}${endpoint}`
          );
        }

        // Return the error response instead of throwing, so the calling code can handle it
        return {
          success: false,
          message: data.message || "API request failed",
          errors: data.errors || [],
          ...data,
        };
      }

      return data;
    } catch (error) {
      console.error("API request error:", {
        url: `${this.baseURL}${endpoint}`,
        error: error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof Error) {
        if (error.message.includes("Unexpected token")) {
          return {
            success: false,
            message:
              "Server is not running or returned HTML instead of JSON. Please start the backend server.",
          };
        }

        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          return {
            success: false,
            message:
              "Network error: Cannot connect to server. Please check if the backend server is running.",
          };
        }

        if (error.message.includes("non-JSON response")) {
          return {
            success: false,
            message: "Route not found or server error",
          };
        }
      }

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    let finalEndpoint = endpoint;

    if (params) {
      const url = new URL(`${this.baseURL}${endpoint}`);
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
      finalEndpoint = endpoint + url.search;
    }

    return this.request<T>(finalEndpoint);
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post("/auth/login", credentials),

  register: (userData: {
    fullName: string;
    email: string;
    password: string;
    company: string;
    department?: string;
    phone?: string;
    role?: string;
  }) => apiClient.post("/auth/register", userData),

  getProfile: () => apiClient.get("/auth/profile"),

  updateProfile: (data: {
    fullName: string;
    company: string;
    department?: string;
    phone?: string;
  }) => apiClient.put("/auth/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put("/auth/change-password", data),

  logout: () => apiClient.post("/auth/logout"),

  verifyToken: () => apiClient.get("/auth/verify"),

  checkEmail: (email: string) => apiClient.post("/auth/check-email", { email }),
};

// Contracts API
export const contractsApi = {
  getAll: (
    params?: PaginationParams & { status?: string; contractorId?: number }
  ) => apiClient.get("/contracts", params),

  getById: (id: number) => apiClient.get(`/contracts/${id}`),

  create: (data: {
    contractNumber: string;
    title: string;
    description?: string;
    contractorId: number;
    value: number;
    startDate: string;
    endDate: string;
    status?: string;
  }) => apiClient.post("/contracts", data),

  update: (
    id: number,
    data: {
      title: string;
      description?: string;
      contractorId: number;
      value: number;
      startDate: string;
      endDate: string;
      status?: string;
      progress?: number;
    }
  ) => apiClient.put(`/contracts/${id}`, data),

  delete: (id: number) => apiClient.delete(`/contracts/${id}`),

  approve: (id: number) => apiClient.put(`/contracts/${id}/approve`),

  getStats: () => apiClient.get("/contracts/stats/overview"),
};

// Contractors API
export const contractorsApi = {
  getAll: (params?: PaginationParams & { status?: string }) =>
    apiClient.get("/contractors", params),

  getById: (id: number) => apiClient.get(`/contractors/${id}`),

  create: (data: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address?: string;
    taxCode?: string;
    bankAccount?: string;
    bankName?: string;
    description?: string;
  }) => apiClient.post("/contractors", data),

  update: (
    id: number,
    data: {
      name: string;
      contactPerson: string;
      email: string;
      phone: string;
      address?: string;
      taxCode?: string;
      bankAccount?: string;
      bankName?: string;
      description?: string;
    }
  ) => apiClient.put(`/contractors/${id}`, data),

  delete: (id: number) => apiClient.delete(`/contractors/${id}`),

  activate: (id: number) => apiClient.put(`/contractors/${id}/activate`),

  getPerformance: (id: number) =>
    apiClient.get(`/contractors/${id}/performance`),
};

// Users API
export const usersApi = {
  getAll: (params?: PaginationParams & { role?: string }) =>
    apiClient.get("/users", params),

  getById: (id: number) => apiClient.get(`/users/${id}`),

  updateRole: (id: number, role: string) =>
    apiClient.put(`/users/${id}/role`, { role }),

  update: (
    id: number,
    userData: {
      fullName: string;
      email: string;
      company: string;
      department?: string;
      phone?: string;
      role: string;
    }
  ) => apiClient.put(`/users/${id}`, userData),

  deactivate: (id: number) => apiClient.put(`/users/${id}/deactivate`),

  delete: (id: number) => apiClient.delete(`/users/${id}`),

  getActivity: (id: number, params?: PaginationParams) =>
    apiClient.get(`/users/${id}/activity`, params),

  getDashboardStats: () => apiClient.get("/users/dashboard/stats"),
};
