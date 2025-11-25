
export const API_BASE = '/api';

export interface UserCreate {
  username: string;
  password: string;
  mail: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserOut {
  id: number;
  username: string;
  mail: string;
}

// Helper for handling headers
const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- Auth Endpoints ---

export const registerUser = async (data: UserCreate): Promise<UserOut> => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail?.[0]?.msg || 'Registration failed');
  }
  return res.json();
};

export const loginUser = async (data: LoginRequest): Promise<TokenResponse> => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
};

export const logoutUser = async (token: string): Promise<void> => {
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: getHeaders(token),
  });
};

export const getUserProfile = async (token: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};
