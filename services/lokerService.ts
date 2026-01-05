import { createCrudService, apiFetch } from './api';

// Loker
export const lokerService = {
  ...createCrudService<any>('/lokers'),
  getAvailable: () => apiFetch<any[]>('/lokers?status=Available'),
  getByLocation: (location: string) => apiFetch<any[]>(`/lokers?location=${location}`),
};

// Loker Request
export const lokerRequestService = {
  ...createCrudService<any>('/loker-requests'),
  getByStatus: (status: string) => apiFetch<any[]>(`/loker-requests?status=${status}`),
  getPending: () => apiFetch<any[]>('/loker-requests?approvalStatus=Pending'),
};
