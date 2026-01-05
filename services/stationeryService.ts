import { createCrudService, apiFetch } from './api';

// Master Item (ATK/ARK)
export const masterItemService = {
  ...createCrudService<any>('/master-items'),
  getByCategory: (category: string) => apiFetch<any[]>(`/master-items?category=${category}`),
  getATK: () => apiFetch<any[]>('/master-items?category=ATK'),
  getARK: () => apiFetch<any[]>('/master-items?category=ARK'),
  getLowStock: () => apiFetch<any[]>('/master-items?lowStock=true'),
};

// Stationery Request
export const stationeryRequestService = {
  ...createCrudService<any>('/stationery-requests'),
  getByType: (type: string) => apiFetch<any[]>(`/stationery-requests?type=${type}`),
  getATKRequests: () => apiFetch<any[]>('/stationery-requests?type=ATK'),
  getARKRequests: () => apiFetch<any[]>('/stationery-requests?type=ARK'),
  getByStatus: (status: string) => apiFetch<any[]>(`/stationery-requests?status=${status}`),
  getPending: () => apiFetch<any[]>('/stationery-requests?approvalStatus=Pending'),
};

// Delivery Location
export const deliveryLocationService = {
  ...createCrudService<any>('/delivery-locations'),
  getActive: () => apiFetch<any[]>('/delivery-locations?status=Active'),
};
