interface ApiResponse<T = any> {
  status: "ok" | "error";
  details?: T;
  errormessage?: string;
  code?: number;
}

export class ApiError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_URL || "";
    this.timeout = 10000;
  }

  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        if (data.status === "error") {
          throw new ApiError(
            data.errormessage ||
              `Request failed with status ${response.status}`,
            data.code
          );
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      if (data.status === "ok") {
        return data.details as T;
      } else if (data.status === "error") {
        throw new ApiError(
          data.errormessage || "Unknown error occurred",
          data.code
        );
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      // console.log("error", error);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw error;
      }

      throw new Error("An unknown error occurred");
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      let queryString = "";

      if (params) {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
          }
        });
        queryString = searchParams.toString();
        if (queryString) {
          queryString = `?${queryString}`;
        }
      }

      return this.request<T>(`${url}${queryString}`, {
        method: "GET",
      });
    } catch (error) {
      console.error(`GET request failed for ${url}:`, error);
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: "DELETE",
    });
  }
}

const apiService = new ApiService();

export default apiService;
