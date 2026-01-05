import { createCrudService, apiFetch } from './api';

// Mock data untuk fallback
let mockBuildings: any[] = [
  { id: 1, name: 'Gedung Kantor Pusat', code: 'GD-001', type: 'Kantor', address: 'Jl. Sudirman No. 1', city: 'Jakarta', area: 5000, floors: 10, status: 'Approved', buildYear: '2015' },
  { id: 2, name: 'Gudang Cikupa', code: 'GD-002', type: 'Gudang', address: 'Jl. Raya Cikupa', city: 'Tangerang', area: 3000, floors: 1, status: 'Approved', buildYear: '2018' },
  { id: 3, name: 'Showroom Surabaya', code: 'GD-003', type: 'Showroom', address: 'Jl. Basuki Rahmat', city: 'Surabaya', area: 1500, floors: 2, status: 'Pending', buildYear: '2020' },
];

let mockBuildingAssets: any[] = [
  { id: 1, buildingId: 1, buildingName: 'Gedung Kantor Pusat', assetName: 'AC Central', assetType: 'HVAC', brand: 'Daikin', quantity: 5, condition: 'Baik', status: 'Approved' },
  { id: 2, buildingId: 1, buildingName: 'Gedung Kantor Pusat', assetName: 'Lift Penumpang', assetType: 'Elevator', brand: 'Schindler', quantity: 2, condition: 'Baik', status: 'Approved' },
  { id: 3, buildingId: 2, buildingName: 'Gudang Cikupa', assetName: 'Forklift', assetType: 'Material Handling', brand: 'Toyota', quantity: 3, condition: 'Baik', status: 'Pending' },
];

let mockMaintenances: any[] = [
  { id: 1, buildingId: 1, buildingName: 'Gedung Kantor Pusat', maintenanceType: 'Preventive', description: 'Perawatan AC rutin', vendor: 'PT Daikin Service', cost: 5000000, date: '2024-01-15', status: 'Approved' },
  { id: 2, buildingId: 1, buildingName: 'Gedung Kantor Pusat', maintenanceType: 'Corrective', description: 'Perbaikan lift', vendor: 'PT Schindler', cost: 15000000, date: '2024-02-20', status: 'Pending' },
];

let mockUtilities: any[] = [
  { id: 1, buildingId: 1, buildingName: 'Gedung Kantor Pusat', type: 'Listrik', provider: 'PLN', accountNo: '123456789', period: '2024-01', amount: 25000000, status: 'Paid' },
  { id: 2, buildingId: 1, buildingName: 'Gedung Kantor Pusat', type: 'Air', provider: 'PAM', accountNo: '987654321', period: '2024-01', amount: 5000000, status: 'Paid' },
  { id: 3, buildingId: 2, buildingName: 'Gudang Cikupa', type: 'Listrik', provider: 'PLN', accountNo: '111222333', period: '2024-01', amount: 15000000, status: 'Unpaid' },
];

let mockCompliances: any[] = [
  { id: 1, buildingId: 1, buildingName: 'Gedung Kantor Pusat', documentType: 'IMB', documentNo: 'IMB-001/2015', issueDate: '2015-01-01', expiryDate: '2025-01-01', status: 'Active' },
  { id: 2, buildingId: 1, buildingName: 'Gedung Kantor Pusat', documentType: 'SLF', documentNo: 'SLF-001/2020', issueDate: '2020-06-01', expiryDate: '2025-06-01', status: 'Active' },
  { id: 3, buildingId: 2, buildingName: 'Gudang Cikupa', documentType: 'IMB', documentNo: 'IMB-002/2018', issueDate: '2018-03-01', expiryDate: '2028-03-01', status: 'Active' },
];

let mockLogBooks: any[] = [
  { id: 1, buildingId: 1, buildingName: 'Gedung Kantor Pusat', date: '2024-01-15', activity: 'Inspeksi rutin', pic: 'Budi', notes: 'Semua dalam kondisi baik' },
  { id: 2, buildingId: 1, buildingName: 'Gedung Kantor Pusat', date: '2024-01-20', activity: 'Perbaikan AC lantai 3', pic: 'Andi', notes: 'AC sudah diperbaiki' },
];

// Helper untuk generate ID baru
const getNextId = (arr: any[]) => Math.max(0, ...arr.map(i => i.id)) + 1;

// Wrapper untuk API call dengan fallback ke mock data
const withMockFallback = <T>(
  apiCall: () => Promise<T>,
  mockFn: () => T
): Promise<T> => {
  return apiCall().catch(() => mockFn());
};

// Building Service dengan fallback
export const buildingService = {
  getAll: (params?: Record<string, string>) => 
    withMockFallback(
      () => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiFetch<any[]>(`/buildings${query}`);
      },
      () => [...mockBuildings]
    ),
  
  getById: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/buildings/${id}`),
      () => mockBuildings.find(b => b.id === id)
    ),
  
  create: (data: any) => 
    withMockFallback(
      () => apiFetch<any>('/buildings', { method: 'POST', body: JSON.stringify(data) }),
      () => {
        const newItem = { ...data, id: getNextId(mockBuildings), status: data.status || 'Pending' };
        mockBuildings.push(newItem);
        return newItem;
      }
    ),
  
  update: (id: number, data: any) => 
    withMockFallback(
      () => apiFetch<any>(`/buildings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => {
        const idx = mockBuildings.findIndex(b => b.id === id);
        if (idx !== -1) {
          mockBuildings[idx] = { ...mockBuildings[idx], ...data };
          return mockBuildings[idx];
        }
        return data;
      }
    ),
  
  delete: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/buildings/${id}`, { method: 'DELETE' }),
      () => {
        mockBuildings = mockBuildings.filter(b => b.id !== id);
        return { message: 'Deleted' };
      }
    ),

  getByType: (type: string) => 
    withMockFallback(
      () => apiFetch<any[]>(`/buildings?type=${type}`),
      () => mockBuildings.filter(b => b.type === type)
    ),
};

// Building Asset Service dengan fallback
export const buildingAssetService = {
  getAll: (params?: Record<string, string>) => 
    withMockFallback(
      () => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiFetch<any[]>(`/building-assets${query}`);
      },
      () => [...mockBuildingAssets]
    ),
  
  getById: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/building-assets/${id}`),
      () => mockBuildingAssets.find(b => b.id === id)
    ),
  
  create: (data: any) => 
    withMockFallback(
      () => apiFetch<any>('/building-assets', { method: 'POST', body: JSON.stringify(data) }),
      () => {
        const newItem = { ...data, id: getNextId(mockBuildingAssets), status: data.status || 'Pending' };
        mockBuildingAssets.push(newItem);
        return newItem;
      }
    ),
  
  update: (id: number, data: any) => 
    withMockFallback(
      () => apiFetch<any>(`/building-assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => {
        const idx = mockBuildingAssets.findIndex(b => b.id === id);
        if (idx !== -1) {
          mockBuildingAssets[idx] = { ...mockBuildingAssets[idx], ...data };
          return mockBuildingAssets[idx];
        }
        return data;
      }
    ),
  
  delete: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/building-assets/${id}`, { method: 'DELETE' }),
      () => {
        mockBuildingAssets = mockBuildingAssets.filter(b => b.id !== id);
        return { message: 'Deleted' };
      }
    ),

  getByBuilding: (buildingId: number) => 
    withMockFallback(
      () => apiFetch<any[]>(`/building-assets?buildingId=${buildingId}`),
      () => mockBuildingAssets.filter(b => b.buildingId === buildingId)
    ),
};

// Building Maintenance Service dengan fallback
export const buildingMaintenanceService = {
  getAll: (params?: Record<string, string>) => 
    withMockFallback(
      () => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiFetch<any[]>(`/building-maintenances${query}`);
      },
      () => [...mockMaintenances]
    ),
  
  getById: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/building-maintenances/${id}`),
      () => mockMaintenances.find(b => b.id === id)
    ),
  
  create: (data: any) => 
    withMockFallback(
      () => apiFetch<any>('/building-maintenances', { method: 'POST', body: JSON.stringify(data) }),
      () => {
        const newItem = { ...data, id: getNextId(mockMaintenances), status: data.status || 'Pending' };
        mockMaintenances.push(newItem);
        return newItem;
      }
    ),
  
  update: (id: number, data: any) => 
    withMockFallback(
      () => apiFetch<any>(`/building-maintenances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => {
        const idx = mockMaintenances.findIndex(b => b.id === id);
        if (idx !== -1) {
          mockMaintenances[idx] = { ...mockMaintenances[idx], ...data };
          return mockMaintenances[idx];
        }
        return data;
      }
    ),
  
  delete: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/building-maintenances/${id}`, { method: 'DELETE' }),
      () => {
        mockMaintenances = mockMaintenances.filter(b => b.id !== id);
        return { message: 'Deleted' };
      }
    ),

  getByBuilding: (buildingId: number) => 
    withMockFallback(
      () => apiFetch<any[]>(`/building-maintenances?buildingId=${buildingId}`),
      () => mockMaintenances.filter(b => b.buildingId === buildingId)
    ),
};

// Utility Service dengan fallback
export const utilityService = {
  getAll: (params?: Record<string, string>) => 
    withMockFallback(
      () => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiFetch<any[]>(`/utilities${query}`);
      },
      () => [...mockUtilities]
    ),
  
  getById: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/utilities/${id}`),
      () => mockUtilities.find(b => b.id === id)
    ),
  
  create: (data: any) => 
    withMockFallback(
      () => apiFetch<any>('/utilities', { method: 'POST', body: JSON.stringify(data) }),
      () => {
        const newItem = { ...data, id: getNextId(mockUtilities), status: data.status || 'Unpaid' };
        mockUtilities.push(newItem);
        return newItem;
      }
    ),
  
  update: (id: number, data: any) => 
    withMockFallback(
      () => apiFetch<any>(`/utilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => {
        const idx = mockUtilities.findIndex(b => b.id === id);
        if (idx !== -1) {
          mockUtilities[idx] = { ...mockUtilities[idx], ...data };
          return mockUtilities[idx];
        }
        return data;
      }
    ),
  
  delete: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/utilities/${id}`, { method: 'DELETE' }),
      () => {
        mockUtilities = mockUtilities.filter(b => b.id !== id);
        return { message: 'Deleted' };
      }
    ),

  getByBuilding: (buildingId: number) => 
    withMockFallback(
      () => apiFetch<any[]>(`/utilities?buildingId=${buildingId}`),
      () => mockUtilities.filter(b => b.buildingId === buildingId)
    ),
};

// Compliance Service dengan fallback
export const complianceService = {
  getAll: (params?: Record<string, string>) => 
    withMockFallback(
      () => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiFetch<any[]>(`/compliances${query}`);
      },
      () => [...mockCompliances]
    ),
  
  getById: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/compliances/${id}`),
      () => mockCompliances.find(b => b.id === id)
    ),
  
  create: (data: any) => 
    withMockFallback(
      () => apiFetch<any>('/compliances', { method: 'POST', body: JSON.stringify(data) }),
      () => {
        const newItem = { ...data, id: getNextId(mockCompliances), status: data.status || 'Active' };
        mockCompliances.push(newItem);
        return newItem;
      }
    ),
  
  update: (id: number, data: any) => 
    withMockFallback(
      () => apiFetch<any>(`/compliances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => {
        const idx = mockCompliances.findIndex(b => b.id === id);
        if (idx !== -1) {
          mockCompliances[idx] = { ...mockCompliances[idx], ...data };
          return mockCompliances[idx];
        }
        return data;
      }
    ),
  
  delete: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/compliances/${id}`, { method: 'DELETE' }),
      () => {
        mockCompliances = mockCompliances.filter(b => b.id !== id);
        return { message: 'Deleted' };
      }
    ),

  getByBuilding: (buildingId: number) => 
    withMockFallback(
      () => apiFetch<any[]>(`/compliances?buildingId=${buildingId}`),
      () => mockCompliances.filter(b => b.buildingId === buildingId)
    ),
};

// LogBook Service dengan fallback
export const logBookService = {
  getAll: (params?: Record<string, string>) => 
    withMockFallback(
      () => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiFetch<any[]>(`/logbooks${query}`);
      },
      () => [...mockLogBooks]
    ),
  
  getById: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/logbooks/${id}`),
      () => mockLogBooks.find(b => b.id === id)
    ),
  
  create: (data: any) => 
    withMockFallback(
      () => apiFetch<any>('/logbooks', { method: 'POST', body: JSON.stringify(data) }),
      () => {
        const newItem = { ...data, id: getNextId(mockLogBooks) };
        mockLogBooks.push(newItem);
        return newItem;
      }
    ),
  
  update: (id: number, data: any) => 
    withMockFallback(
      () => apiFetch<any>(`/logbooks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => {
        const idx = mockLogBooks.findIndex(b => b.id === id);
        if (idx !== -1) {
          mockLogBooks[idx] = { ...mockLogBooks[idx], ...data };
          return mockLogBooks[idx];
        }
        return data;
      }
    ),
  
  delete: (id: number) => 
    withMockFallback(
      () => apiFetch<any>(`/logbooks/${id}`, { method: 'DELETE' }),
      () => {
        mockLogBooks = mockLogBooks.filter(b => b.id !== id);
        return { message: 'Deleted' };
      }
    ),

  getByBuilding: (buildingId: number) => 
    withMockFallback(
      () => apiFetch<any[]>(`/logbooks?buildingId=${buildingId}`),
      () => mockLogBooks.filter(b => b.buildingId === buildingId)
    ),
};

// Building Reminders
export const buildingReminderService = {
  getAll: () => withMockFallback(
    () => apiFetch<any[]>('/reminders/building'),
    () => []
  ),
};
