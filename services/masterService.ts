import { apiFetch } from './api';

// Mock master data
const mockMasterData: Record<string, any[]> = {
  VEHICLE_TYPE: [{ id: 1, name: 'Sedan' }, { id: 2, name: 'SUV' }, { id: 3, name: 'MPV' }, { id: 4, name: 'Truck' }, { id: 5, name: 'Motorcycle' }],
  BUILDING_TYPE: [{ id: 1, name: 'Kantor' }, { id: 2, name: 'Gudang' }, { id: 3, name: 'Showroom' }, { id: 4, name: 'Workshop' }, { id: 5, name: 'Ruko' }],
  ASSET_CATEGORY: [{ id: 1, name: 'HC' }, { id: 2, name: 'IT' }, { id: 3, name: 'CS' }],
  LOCATION: [{ id: 1, name: 'Jakarta' }, { id: 2, name: 'Surabaya' }, { id: 3, name: 'Bandung' }, { id: 4, name: 'Medan' }, { id: 5, name: 'Semarang' }],
  DEPARTMENT: [{ id: 1, name: 'IT' }, { id: 2, name: 'HR' }, { id: 3, name: 'Finance' }, { id: 4, name: 'GA' }, { id: 5, name: 'Sales' }, { id: 6, name: 'Marketing' }],
  BRAND: [{ id: 1, name: 'Toyota' }, { id: 2, name: 'Honda' }, { id: 3, name: 'Mitsubishi' }, { id: 4, name: 'Daihatsu' }, { id: 5, name: 'Suzuki' }],
  COLOR: [{ id: 1, name: 'Putih' }, { id: 2, name: 'Hitam' }, { id: 3, name: 'Silver' }, { id: 4, name: 'Merah' }, { id: 5, name: 'Biru' }],
  UOM: [{ id: 1, name: 'Pcs' }, { id: 2, name: 'Box' }, { id: 3, name: 'Rim' }, { id: 4, name: 'Pack' }, { id: 5, name: 'Unit' }],
  UTILITY_TYPE: [{ id: 1, name: 'Listrik' }, { id: 2, name: 'Air' }, { id: 3, name: 'Gas' }, { id: 4, name: 'Internet' }],
  VENDOR_CATEGORY: [{ id: 1, name: 'Supplier' }, { id: 2, name: 'Contractor' }, { id: 3, name: 'Service Provider' }],
};

let mockGeneralMasters: any[] = [];
let mockApprovals: any[] = [
  { id: 1, module: 'VEHICLE_REQUEST', name: 'Approval Kendaraan', tiers: [{ level: 1, role: 'Manager GA' }, { level: 2, role: 'GM' }] },
  { id: 2, module: 'BUILDING_REQUEST', name: 'Approval Gedung', tiers: [{ level: 1, role: 'Manager GA' }, { level: 2, role: 'GM' }] },
];

const getNextId = (arr: any[]) => Math.max(0, ...arr.map(i => i.id)) + 1;

const withMockFallback = <T>(apiCall: () => Promise<T>, mockFn: () => T): Promise<T> => {
  return apiCall().catch(() => mockFn());
};

// General Master Service
export const generalMasterService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/general-masters${q}`); },
    () => [...mockGeneralMasters]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/general-masters/${id}`), () => mockGeneralMasters.find(m => m.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/general-masters', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockGeneralMasters) }; mockGeneralMasters.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/general-masters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockGeneralMasters.findIndex(m => m.id === id); if (i !== -1) { mockGeneralMasters[i] = { ...mockGeneralMasters[i], ...data }; return mockGeneralMasters[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/general-masters/${id}`, { method: 'DELETE' }),
    () => { mockGeneralMasters = mockGeneralMasters.filter(m => m.id !== id); return { message: 'Deleted' }; }
  ),
  getByCategory: (category: string) => withMockFallback(
    () => apiFetch<any[]>(`/general-masters/category/${category}`),
    () => mockMasterData[category] || []
  ),
  bulkCreate: (data: any[]) => withMockFallback(
    () => apiFetch<any>('/general-masters/bulk', { method: 'POST', body: JSON.stringify(data) }),
    () => { data.forEach(d => mockGeneralMasters.push({ ...d, id: getNextId(mockGeneralMasters) })); return { message: 'Created' }; }
  ),
};

// Master Categories Service
export const masterCategoryService = {
  getAll: () => withMockFallback(
    () => apiFetch<any[]>('/master-categories'),
    () => Object.keys(mockMasterData).map((k, i) => ({ id: i + 1, code: k, name: k }))
  ),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/master-categories', { method: 'POST', body: JSON.stringify(data) }),
    () => data
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/master-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => data
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/master-categories/${id}`, { method: 'DELETE' }),
    () => ({ message: 'Deleted' })
  ),
};

// Master Approval Service
export const masterApprovalService = {
  getAll: (params?: Record<string, string>) => withMockFallback(
    () => { const q = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch<any[]>(`/master-approvals${q}`); },
    () => [...mockApprovals]
  ),
  getById: (id: number) => withMockFallback(() => apiFetch<any>(`/master-approvals/${id}`), () => mockApprovals.find(a => a.id === id)),
  create: (data: any) => withMockFallback(
    () => apiFetch<any>('/master-approvals', { method: 'POST', body: JSON.stringify(data) }),
    () => { const n = { ...data, id: getNextId(mockApprovals) }; mockApprovals.push(n); return n; }
  ),
  update: (id: number, data: any) => withMockFallback(
    () => apiFetch<any>(`/master-approvals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    () => { const i = mockApprovals.findIndex(a => a.id === id); if (i !== -1) { mockApprovals[i] = { ...mockApprovals[i], ...data }; return mockApprovals[i]; } return data; }
  ),
  delete: (id: number) => withMockFallback(
    () => apiFetch<any>(`/master-approvals/${id}`, { method: 'DELETE' }),
    () => { mockApprovals = mockApprovals.filter(a => a.id !== id); return { message: 'Deleted' }; }
  ),
  getByModule: (module: string) => withMockFallback(
    () => apiFetch<any[]>(`/master-approvals?module=${module}`),
    () => mockApprovals.filter(a => a.module === module)
  ),
};

// Helper to get master data by category
export const getMasterData = {
  vehicleTypes: () => generalMasterService.getByCategory('VEHICLE_TYPE'),
  vehicleModels: () => generalMasterService.getByCategory('VEHICLE_MODEL'),
  buildingTypes: () => generalMasterService.getByCategory('BUILDING_TYPE'),
  assetCategories: () => generalMasterService.getByCategory('ASSET_CATEGORY'),
  assetTypes: () => generalMasterService.getByCategory('ASSET_TYPE'),
  locations: () => generalMasterService.getByCategory('LOCATION'),
  departments: () => generalMasterService.getByCategory('DEPARTMENT'),
  channels: () => generalMasterService.getByCategory('CHANNEL'),
  brands: () => generalMasterService.getByCategory('BRAND'),
  colors: () => generalMasterService.getByCategory('COLOR'),
  uom: () => generalMasterService.getByCategory('UOM'),
  costCenters: () => generalMasterService.getByCategory('COST_CENTER'),
  serviceTypes: () => generalMasterService.getByCategory('SERVICE_TYPE'),
  maintenanceTypes: () => generalMasterService.getByCategory('MAINTENANCE_TYPE'),
  insuranceTypes: () => generalMasterService.getByCategory('INSURANCE_TYPE'),
  documentTypes: () => generalMasterService.getByCategory('DOCUMENT_TYPE'),
  paymentTypes: () => generalMasterService.getByCategory('PAYMENT_TYPE'),
  taxTypes: () => generalMasterService.getByCategory('TAX_TYPE'),
  utilityTypes: () => generalMasterService.getByCategory('UTILITY_TYPE'),
  vendorCategories: () => generalMasterService.getByCategory('VENDOR_CATEGORY'),
  operators: () => generalMasterService.getByCategory('OPERATOR'),
  ppn: () => generalMasterService.getByCategory('PPN'),
};
