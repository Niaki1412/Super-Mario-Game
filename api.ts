

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

// Map Interfaces

export interface MapIn {
  id?: number | null;
  map_data: string; // JSON string of GameMap
  is_public?: boolean;
  title?: string;
}

// Response from /api/my_maps
export interface MapListItem {
  id: number;
  status: number;
  user_id: number;
  is_public: boolean;
  title?: string;
}

export interface PublicMapListItem {
  id: number;
  map_id: number;
  title: string;
  description: string | null;
  cover: string | null;
  create_at: string;
}

// Response from /api/map/<id>
export interface MapDetail {
  id: number;
  map_data: string; // JSON string
  user_id?: number;
  is_public?: boolean;
  status?: number;
  create_at?: string;
  update_at?: string;
  title?: string;
}

// Specific response for Save Map endpoint
export interface SaveMapResponse {
    map_id: number;
}

export interface UploadResponse {
    url: string;
    origin_name: string;
}

// Keeping legacy MapOut for compatibility if needed, but aligned with Detail
export type MapOut = MapDetail;

export interface DeleteIn {
  map_id: number;
}

export interface RestoreIn {
  map_id: number;
}

export interface PublishIn {
  map_id: number;
  title: string;
  description?: string | null;
  cover?: string | null;
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

export const getUserProfile = async (token: string): Promise<UserOut> => {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  const json = await res.json();
  return json.data;
};

// --- Map Endpoints ---

export const saveMap = async (data: MapIn, token: string): Promise<SaveMapResponse> => {
   const res = await fetch(`${API_BASE}/map/save`, {
     method: 'POST',
     headers: getHeaders(token),
     body: JSON.stringify(data)
   });
   if (!res.ok) {
       const err = await res.json();
       throw new Error(err.detail || 'Failed to save map');
   }
   const json = await res.json();
   return json.data; // Expected { data: { map_id: 3 } }
};

export const getMyMaps = async (token: string, status?: number): Promise<MapListItem[]> => {
   const url = status !== undefined ? `${API_BASE}/my_maps?status=${status}` : `${API_BASE}/my_maps`;
   const res = await fetch(url, {
     method: 'GET',
     headers: getHeaders(token)
   });
   if (!res.ok) throw new Error('Failed to fetch maps');
   const json = await res.json();
   // Expecting structure { data: [...], ... }
   return json.data; 
};

export const getMapById = async (id: number, token?: string | null): Promise<MapDetail> => {
    const res = await fetch(`${API_BASE}/map/${id}`, {
        method: 'GET',
        headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch map');
    const json = await res.json();
    return json.data;
};

export const deleteMap = async (data: DeleteIn, token: string): Promise<void> => {
   const res = await fetch(`${API_BASE}/map/delete`, {
     method: 'POST',
     headers: getHeaders(token),
     body: JSON.stringify(data)
   });
   if (!res.ok) throw new Error('Failed to delete map');
};

export const restoreMap = async (data: RestoreIn, token: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/map/restore`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to restore map');
};

export const getPublicMaps = async (): Promise<PublicMapListItem[]> => {
   const res = await fetch(`${API_BASE}/public_map_list`, {
     method: 'GET',
     headers: getHeaders()
   });
   if (!res.ok) throw new Error('Failed to fetch public maps');
   const json = await res.json();
   return json; // The provided example shows direct array return [ { ... } ]
};

export const publishMap = async (data: PublishIn, token: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/publish/map`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to publish map');
};

export const uploadFile = async (file: File, token: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) {
        throw new Error('Upload failed');
    }
    const json = await res.json();
    return json.data;
};
