// Base API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Token management
export const getToken = () => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setUser = (user: any) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

// Base fetch wrapper with auth
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    removeUser();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Generic CRUD operations
export const createCrudService = <T extends { id?: number | string }>(endpoint: string) => ({
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<T[]>(`${endpoint}${query}`);
  },
  
  getById: (id: number | string) => apiFetch<T>(`${endpoint}/${id}`),
  
  create: (data: Partial<T>) => apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: number | string, data: Partial<T>) => apiFetch<T>(`${endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: number | string) => apiFetch<{ message: string }>(`${endpoint}/${id}`, {
    method: 'DELETE',
  }),
});
