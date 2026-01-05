import { apiFetch } from './api';

// Mock data
let mockUsers: any[] = [
  { id: 1, username: 'admin', email: 'admin@modena.com', fullName: 'Administrator', role: 'Admin', department: 'IT', branch: 'Head Office', status: 'Active' },
  { id: 2, username: 'manager.ga', email: 'manager.ga@modena.com', fullName: 'Manager GA', role: 'Manager', department: 'GA', branch: 'Head Office', status: 'Active' },
  { id: 3, username: 'staff.ga', email: 'staff.ga@modena.com', fullName: 'Staff GA', role: 'Staff', department: 'GA', branch: 'Jakarta', status: 'Active' },
  { id: 4, username: 'staff.it', email: 'staff.it@modena.com', fullName: 'Staff IT', role: 'Staff', department: 'IT', branch: 'Jakarta', status: 'Active' },
];

const getNextId = (arr: any[]) => Math.max(0, ...arr.map(i => i.id)) + 1;

const withMockFallback = <T>(apiCall: () => Promise<T>, mockFn: () => T): Promise<T> => {
  return apiCall().catch(() => mockFn());
};

export const userService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/users${q}`); },
    () => [...mockUsers]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/users/${id}`), () => mockUsers.find(u => u.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockUsers), status: 'Active' }; mockUsers.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockUsers.findIndex(u => u.id === id); if (i !== -1) { mockUsers[i] = { ...mockUsers[i], ...data }; return mockUsers[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/users/${id}`, { method: 'DELETE' }),
    () => { mockUsers = mockUsers.filter(u => u.id !== id); return { message: 'Deleted' }; }
  ),
  getByRole: (role: string) => withMockFallback(
    () => apiFetch<any[]>(`/users?role=${role}`),
    () => mockUsers.filter(u => u.role === role)
  ),
  getByDepartment: (department: string) => withMockFallback(
    () => apiFetch<any[]>(`/users?department=${department}`),
    () => mockUsers.filter(u => u.department === department)
  ),
  getByBranch: (branch: string) => withMockFallback(
    () => apiFetch<any[]>(`/users?branch=${branch}`),
    () => mockUsers.filter(u => u.branch === branch)
  ),
  getActive: () => withMockFallback(
    () => apiFetch<any[]>('/users?status=Active'),
    () => mockUsers.filter(u => u.status === 'Active')
  ),
  search: (query: string) => withMockFallback(
    () => apiFetch<any[]>(`/users?search=${query}`),
    () => mockUsers.filter(u => u.fullName.toLowerCase().includes(query.toLowerCase()) || u.username.toLowerCase().includes(query.toLowerCase()))
  ),
};
