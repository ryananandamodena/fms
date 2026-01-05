import { createCrudService, apiFetch } from './api';

// Vendor
export const vendorService = {
  ...createCrudService<any>('/vendors'),
  getByCategory: (category: string) => apiFetch<any[]>(`/vendors?category=${category}`),
  getByType: (type: string) => apiFetch<any[]>(`/vendors?type=${type}`),
  getActive: () => apiFetch<any[]>('/vendors?status=Active'),
  search: (query: string) => apiFetch<any[]>(`/vendors?search=${query}`),
};

// Insurance
export const insuranceService = {
  ...createCrudService<any>('/insurances'),
  getByCategory: (category: string) => apiFetch<any[]>(`/insurances?category=${category}`),
  getVehicleInsurances: () => apiFetch<any[]>('/insurances?category=Vehicle'),
  getBuildingInsurances: () => apiFetch<any[]>('/insurances?category=Building'),
  getByAsset: (assetId: string) => apiFetch<any[]>(`/insurances?assetId=${assetId}`),
};

// Insurance Claims
export const insuranceClaimService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<any[]>(`/insurance-claims${query}`);
  },
  getByInsurance: (insuranceId: number) => apiFetch<any[]>(`/insurance-claims?insuranceId=${insuranceId}`),
  create: (data: any) => apiFetch<any>('/insurance-claims', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiFetch<any>(`/insurance-claims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};
