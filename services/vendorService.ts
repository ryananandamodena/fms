import { apiFetch } from './api';

// Mock data
let mockVendors: any[] = [
  { id: 1, code: 'VND-001', name: 'PT Rental Mobil Indonesia', category: 'Rental', type: 'Vehicle', address: 'Jakarta', phone: '021-1234567', email: 'info@rental.com', status: 'Active' },
  { id: 2, code: 'VND-002', name: 'CV Bengkel Jaya', category: 'Service', type: 'Vehicle', address: 'Surabaya', phone: '031-7654321', email: 'bengkel@jaya.com', status: 'Active' },
  { id: 3, code: 'VND-003', name: 'PT Asuransi Astra', category: 'Insurance', type: 'General', address: 'Jakarta', phone: '021-9876543', email: 'info@astra.com', status: 'Active' },
  { id: 4, code: 'VND-004', name: 'PT Cleaning Service', category: 'Service', type: 'Building', address: 'Bandung', phone: '022-1112233', email: 'cs@cleaning.com', status: 'Active' },
];

const getNextId = (arr: any[]) => Math.max(0, ...arr.map(i => i.id)) + 1;

const withMockFallback = <T>(apiCall: () => Promise<T>, mockFn: () => T): Promise<T> => {
  return apiCall().catch(() => mockFn());
};

// Vendor Service
export const vendorService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/vendors${q}`); },
    () => [...mockVendors]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/vendors/${id}`), () => mockVendors.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/vendors', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockVendors), status: 'Active' }; mockVendors.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockVendors.findIndex(v => v.id === id); if (i !== -1) { mockVendors[i] = { ...mockVendors[i], ...data }; return mockVendors[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/vendors/${id}`, { method: 'DELETE' }),
    () => { mockVendors = mockVendors.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
  getByCategory: (category: string) => withMockFallback(
    () => apiFetch<any[]>(`/vendors?category=${category}`),
    () => mockVendors.filter(v => v.category === category)
  ),
  getByType: (type: string) => withMockFallback(
    () => apiFetch<any[]>(`/vendors?type=${type}`),
    () => mockVendors.filter(v => v.type === type)
  ),
  getActive: () => withMockFallback(
    () => apiFetch<any[]>('/vendors?status=Active'),
    () => mockVendors.filter(v => v.status === 'Active')
  ),
  search: (query: string) => withMockFallback(
    () => apiFetch<any[]>(`/vendors?search=${query}`),
    () => mockVendors.filter(v => v.name.toLowerCase().includes(query.toLowerCase()))
  ),
};
