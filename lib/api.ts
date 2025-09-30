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
  data: {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API request error:", error);
      if (
        error instanceof Error &&
        error.message.includes("Unexpected token")
      ) {
        throw new Error(
          "Server is not running or returned HTML instead of JSON. Please start the backend server."
        );
      }
      throw error;
    }
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
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

  deactivate: (id: number) => apiClient.put(`/users/${id}/deactivate`),

  getActivity: (id: number, params?: PaginationParams) =>
    apiClient.get(`/users/${id}/activity`, params),

  getDashboardStats: () => apiClient.get("/users/dashboard/stats"),
};
