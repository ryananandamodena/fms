import { apiFetch } from './api';

// Mock data
let mockAssets: any[] = [
  { id: 1, assetCode: 'AST-HC-001', name: 'Meja Kerja', category: 'HC', brand: 'Informa', location: 'Jakarta', department: 'HR', condition: 'Baik', status: 'Approved', purchaseDate: '2023-01-15', purchasePrice: 2500000 },
  { id: 2, assetCode: 'AST-IT-001', name: 'Laptop Dell', category: 'IT', brand: 'Dell', model: 'Latitude 5520', location: 'Jakarta', department: 'IT', condition: 'Baik', status: 'Approved', purchaseDate: '2023-03-20', purchasePrice: 15000000 },
  { id: 3, assetCode: 'AST-IT-002', name: 'Monitor LG', category: 'IT', brand: 'LG', model: '27UK850', location: 'Surabaya', department: 'Finance', condition: 'Baik', status: 'Pending', purchaseDate: '2023-06-10', purchasePrice: 5000000 },
  { id: 4, assetCode: 'AST-CS-001', name: 'Display Showcase', category: 'CS', brand: 'Custom', location: 'Bandung', department: 'Sales', condition: 'Baik', status: 'Approved', purchaseDate: '2023-02-01', purchasePrice: 8000000 },
];

let mockMutations: any[] = [
  { id: 1, assetId: 1, assetCode: 'AST-HC-001', assetName: 'Meja Kerja', fromLocation: 'Jakarta', toLocation: 'Surabaya', date: '2024-02-15', reason: 'Rotasi', status: 'Approved' },
];

let mockSales: any[] = [
  { id: 1, assetId: 3, assetCode: 'AST-IT-002', assetName: 'Monitor LG', askingPrice: 3000000, status: 'Open', bids: [] },
];

let mockMaintenances: any[] = [
  { id: 1, assetId: 2, assetCode: 'AST-IT-001', assetName: 'Laptop Dell', maintenanceType: 'Preventive', description: 'Cleaning & checkup', vendor: 'IT Support', cost: 500000, date: '2024-01-20', status: 'Completed' },
];

const getNextId = (arr: any[]) => Math.max(0, ...arr.map(i => i.id)) + 1;

const withMockFallback = <T>(apiCall: () => Promise<T>, mockFn: () => T): Promise<T> => {
  return apiCall().catch(() => mockFn());
};

// General Asset Service
export const generalAssetService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/general-assets${q}`); },
    () => [...mockAssets]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/general-assets/${id}`), () => mockAssets.find(a => a.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/general-assets', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockAssets), status: 'Pending' }; mockAssets.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/general-assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockAssets.findIndex(a => a.id === id); if (i !== -1) { mockAssets[i] = { ...mockAssets[i], ...data }; return mockAssets[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/general-assets/${id}`, { method: 'DELETE' }),
    () => { mockAssets = mockAssets.filter(a => a.id !== id); return { message: 'Deleted' }; }
  ),
  getByCategory: (category: string) => withMockFallback(
    () => apiFetch<any[]>(`/general-assets?category=${category}`),
    () => mockAssets.filter(a => a.category === category)
  ),
  getHC: () => withMockFallback(() => apiFetch<any[]>('/general-assets?category=HC'), () => mockAssets.filter(a => a.category === 'HC')),
  getIT: () => withMockFallback(() => apiFetch<any[]>('/general-assets?category=IT'), () => mockAssets.filter(a => a.category === 'IT')),
  getCS: () => withMockFallback(() => apiFetch<any[]>('/general-assets?category=CS'), () => mockAssets.filter(a => a.category === 'CS')),
};

// Asset Mutation Service
export const assetMutationService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/asset-mutations${q}`); },
    () => [...mockMutations]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/asset-mutations/${id}`), () => mockMutations.find(a => a.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/asset-mutations', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockMutations), status: 'Pending' }; mockMutations.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/asset-mutations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockMutations.findIndex(a => a.id === id); if (i !== -1) { mockMutations[i] = { ...mockMutations[i], ...data }; return mockMutations[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/asset-mutations/${id}`, { method: 'DELETE' }),
    () => { mockMutations = mockMutations.filter(a => a.id !== id); return { message: 'Deleted' }; }
  ),
};

// Asset Sale Service
export const assetSaleService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/asset-sales${q}`); },
    () => [...mockSales]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/asset-sales/${id}`), () => mockSales.find(a => a.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/asset-sales', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockSales), status: 'Open', bids: [] }; mockSales.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/asset-sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockSales.findIndex(a => a.id === id); if (i !== -1) { mockSales[i] = { ...mockSales[i], ...data }; return mockSales[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/asset-sales/${id}`, { method: 'DELETE' }),
    () => { mockSales = mockSales.filter(a => a.id !== id); return { message: 'Deleted' }; }
  ),
};

// Asset Maintenance Service
export const assetMaintenanceService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/asset-maintenances${q}`); },
    () => [...mockMaintenances]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/asset-maintenances/${id}`), () => mockMaintenances.find(a => a.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/asset-maintenances', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockMaintenances), status: 'Pending' }; mockMaintenances.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/asset-maintenances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockMaintenances.findIndex(a => a.id === id); if (i !== -1) { mockMaintenances[i] = { ...mockMaintenances[i], ...data }; return mockMaintenances[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/asset-maintenances/${id}`, { method: 'DELETE' }),
    () => { mockMaintenances = mockMaintenances.filter(a => a.id !== id); return { message: 'Deleted' }; }
  ),
};

// Asset Reminders
export const assetReminderService = {
  getAll: () => withMockFallback(() => apiFetch<any[]>('/reminders/asset'), () => []),
};
