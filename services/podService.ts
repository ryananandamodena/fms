import { createCrudService, apiFetch } from './api';

// POD
export const podService = {
  ...createCrudService<any>('/pods'),
  getByStatus: (status: string) => apiFetch<any[]>(`/pods?status=${status}`),
  getAvailable: () => apiFetch<any[]>('/pods?status=Available'),
};

// POD Occupant
export const podOccupantService = {
  ...createCrudService<any>('/pod-occupants'),
  getByPod: (podId: number) => apiFetch<any[]>(`/pod-occupants?podId=${podId}`),
  getActive: () => apiFetch<any[]>('/pod-occupants?status=Active'),
};

// POD Request
export const podRequestService = {
  ...createCrudService<any>('/pod-requests'),
  getByStatus: (status: string) => apiFetch<any[]>(`/pod-requests?status=${status}`),
  getPending: () => apiFetch<any[]>('/pod-requests?approvalStatus=Pending'),
};
