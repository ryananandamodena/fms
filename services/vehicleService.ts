import { apiFetch } from './api';

// Mock data
let mockVehicles: any[] = [
  { id: 1, noPolisi: 'B 1234 ABC', brand: 'Toyota', model: 'Avanza', year: 2022, type: 'MPV', color: 'Putih', status: 'Approved', location: 'Jakarta', department: 'GA' },
  { id: 2, noPolisi: 'B 5678 DEF', brand: 'Honda', model: 'Brio', year: 2021, type: 'Hatchback', color: 'Merah', status: 'Approved', location: 'Surabaya', department: 'Sales' },
  { id: 3, noPolisi: 'B 9012 GHI', brand: 'Mitsubishi', model: 'L300', year: 2020, type: 'Truck', color: 'Hitam', status: 'Pending', location: 'Bandung', department: 'Operations' },
];

let mockContracts: any[] = [
  { id: 1, noPolisi: 'B 1234 ABC', contractNo: 'CTR-001', vendor: 'PT Rental Mobil', startDate: '2024-01-01', endDate: '2024-12-31', monthlyRate: 5000000, status: 'Active' },
  { id: 2, noPolisi: 'B 5678 DEF', contractNo: 'CTR-002', vendor: 'PT Sewa Kendaraan', startDate: '2024-02-01', endDate: '2025-01-31', monthlyRate: 4500000, status: 'Active' },
];

let mockServices: any[] = [
  { id: 1, noPolisi: 'B 1234 ABC', serviceType: 'Servis Rutin', vendor: 'Bengkel Toyota', date: '2024-01-15', cost: 1500000, km: 50000, status: 'Completed' },
  { id: 2, noPolisi: 'B 5678 DEF', serviceType: 'Ganti Oli', vendor: 'Bengkel Honda', date: '2024-02-20', cost: 500000, km: 30000, status: 'Completed' },
];

let mockTaxKirs: any[] = [
  { id: 1, noPolisi: 'B 1234 ABC', type: 'Pajak', amount: 2500000, dueDate: '2024-06-15', paidDate: '2024-06-10', status: 'Paid' },
  { id: 2, noPolisi: 'B 5678 DEF', type: 'KIR', amount: 500000, dueDate: '2024-07-20', paidDate: null, status: 'Pending' },
];

let mockMutations: any[] = [
  { id: 1, noPolisi: 'B 1234 ABC', assetType: 'Vehicle', fromLocation: 'Jakarta', toLocation: 'Surabaya', date: '2024-03-01', reason: 'Rotasi', status: 'Approved' },
];

let mockSales: any[] = [
  { id: 1, noPolisi: 'B 9999 XYZ', brand: 'Daihatsu', model: 'Xenia', year: 2018, askingPrice: 120000000, status: 'Open', bids: [] },
];

let mockInsurances: any[] = [
  { id: 1, noPolisi: 'B 1234 ABC', category: 'Vehicle', policyNo: 'POL-V001', provider: 'Asuransi Astra', startDate: '2024-01-01', endDate: '2025-01-01', premium: 5000000, status: 'Active' },
  { id: 2, buildingName: 'Gedung Kantor Pusat', category: 'Building', policyNo: 'POL-B001', provider: 'Asuransi Jasindo', startDate: '2024-01-01', endDate: '2025-01-01', premium: 25000000, status: 'Active' },
];

const getNextId = (arr: any[]) => Math.max(0, ...arr.map(i => i.id)) + 1;

const withMockFallback = <T>(apiCall: () => Promise<T>, mockFn: () => T): Promise<T> => {
  return apiCall().catch(() => mockFn());
};

// Vehicle Service
export const vehicleService = {
  getAll: (params?: Record<string, string>) => 
    withMockFallback(
      () => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return apiFetch<any[]>(`/vehicles${query}`);
      },
      () => [...mockVehicles]
    ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/vehicles/${id}`), () => mockVehicles.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockVehicles), status: 'Pending' }; mockVehicles.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockVehicles.findIndex(v => v.id === id); if (i !== -1) { mockVehicles[i] = { ...mockVehicles[i], ...data }; return mockVehicles[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/vehicles/${id}`, { method: 'DELETE' }),
    () => { mockVehicles = mockVehicles.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
};

// Vehicle Contract Service
export const vehicleContractService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/vehicle-contracts${q}`); },
    () => [...mockContracts]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/vehicle-contracts/${id}`), () => mockContracts.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/vehicle-contracts', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockContracts), status: 'Active' }; mockContracts.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/vehicle-contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockContracts.findIndex(v => v.id === id); if (i !== -1) { mockContracts[i] = { ...mockContracts[i], ...data }; return mockContracts[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/vehicle-contracts/${id}`, { method: 'DELETE' }),
    () => { mockContracts = mockContracts.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
};

// Vehicle Service (Servis)
export const vehicleServiceService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/vehicle-services${q}`); },
    () => [...mockServices]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/vehicle-services/${id}`), () => mockServices.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/vehicle-services', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockServices), status: 'Pending' }; mockServices.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/vehicle-services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockServices.findIndex(v => v.id === id); if (i !== -1) { mockServices[i] = { ...mockServices[i], ...data }; return mockServices[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/vehicle-services/${id}`, { method: 'DELETE' }),
    () => { mockServices = mockServices.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
};

// Tax & KIR Service
export const taxKirService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/tax-kirs${q}`); },
    () => [...mockTaxKirs]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/tax-kirs/${id}`), () => mockTaxKirs.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/tax-kirs', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockTaxKirs), status: 'Pending' }; mockTaxKirs.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/tax-kirs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockTaxKirs.findIndex(v => v.id === id); if (i !== -1) { mockTaxKirs[i] = { ...mockTaxKirs[i], ...data }; return mockTaxKirs[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/tax-kirs/${id}`, { method: 'DELETE' }),
    () => { mockTaxKirs = mockTaxKirs.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
};

// Vehicle Mutation Service
export const vehicleMutationService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/vehicle-mutations${q}`); },
    () => [...mockMutations]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/vehicle-mutations/${id}`), () => mockMutations.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/vehicle-mutations', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockMutations), status: 'Pending' }; mockMutations.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/vehicle-mutations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockMutations.findIndex(v => v.id === id); if (i !== -1) { mockMutations[i] = { ...mockMutations[i], ...data }; return mockMutations[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/vehicle-mutations/${id}`, { method: 'DELETE' }),
    () => { mockMutations = mockMutations.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
};

// Vehicle Sale Service
export const vehicleSaleService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/vehicle-sales${q}`); },
    () => [...mockSales]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/vehicle-sales/${id}`), () => mockSales.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/vehicle-sales', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockSales), status: 'Open', bids: [] }; mockSales.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/vehicle-sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockSales.findIndex(v => v.id === id); if (i !== -1) { mockSales[i] = { ...mockSales[i], ...data }; return mockSales[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/vehicle-sales/${id}`, { method: 'DELETE' }),
    () => { mockSales = mockSales.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
};

// Insurance Service
export const insuranceService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/insurances${q}`); },
    () => [...mockInsurances]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/insurances/${id}`), () => mockInsurances.find(v => v.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/insurances', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockInsurances), status: 'Active' }; mockInsurances.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/insurances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockInsurances.findIndex(v => v.id === id); if (i !== -1) { mockInsurances[i] = { ...mockInsurances[i], ...data }; return mockInsurances[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/insurances/${id}`, { method: 'DELETE' }),
    () => { mockInsurances = mockInsurances.filter(v => v.id !== id); return { message: 'Deleted' }; }
  ),
  getVehicleInsurances: () => withMockFallback(
    () => apiFetch<any[]>('/insurances?category=Vehicle'),
    () => mockInsurances.filter(i => i.category === 'Vehicle')
  ),
  getBuildingInsurances: () => withMockFallback(
    () => apiFetch<any[]>('/insurances?category=Building'),
    () => mockInsurances.filter(i => i.category === 'Building')
  ),
};

// Vehicle Reminders
export const vehicleReminderService = {
  getAll: () => withMockFallback(() => apiFetch<any[]>('/reminders/vehicle'), () => []),
};
