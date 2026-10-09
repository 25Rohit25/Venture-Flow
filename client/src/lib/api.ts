import { ApiResponse } from './types.js';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, status = 500, code = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // sends and receives httpOnly auth cookies
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkError: any) {
    throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0, 'NETWORK_ERROR');
  }

  // 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('Failed to parse server response.', response.status, 'PARSE_ERROR');
  }

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    const errorCode = json.error?.code || 'REQUEST_FAILED';
    throw new ApiError(errorMsg, response.status, errorCode, json.error?.details);
  }

  return json.data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
