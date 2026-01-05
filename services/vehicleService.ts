import { createCrudService, apiFetch } from './api';

// Vehicle
export const vehicleService = {
  ...createCrudService<any>('/vehicles'),
  getByStatus: (status: string) => apiFetch<any[]>(`/vehicles?status=${status}`),
};

// Vehicle Contract
export const vehicleContractService = {
  ...createCrudService<any>('/vehicle-contracts'),
  getByVehicle: (noPolisi: string) => apiFetch<any[]>(`/vehicle-contracts?noPolisi=${noPolisi}`),
};

// Vehicle Service
export const vehicleServiceService = {
  ...createCrudService<any>('/vehicle-services'),
  getByVehicle: (noPolisi: string) => apiFetch<any[]>(`/vehicle-services?noPolisi=${noPolisi}`),
};

// Tax & KIR
export const taxKirService = {
  ...createCrudService<any>('/tax-kirs'),
  getByVehicle: (noPolisi: string) => apiFetch<any[]>(`/tax-kirs?noPolisi=${noPolisi}`),
};

// Vehicle Mutation
export const vehicleMutationService = {
  ...createCrudService<any>('/vehicle-mutations'),
  getByType: (type: string) => apiFetch<any[]>(`/vehicle-mutations?assetType=${type}`),
};

// Vehicle Sale
export const vehicleSaleService = {
  ...createCrudService<any>('/vehicle-sales'),
  placeBid: (saleId: number, bid: any) => apiFetch<any>(`/vehicle-sales/${saleId}/bids`, {
    method: 'POST',
    body: JSON.stringify(bid),
  }),
};

// Vehicle Reminders
export const vehicleReminderService = {
  getAll: () => apiFetch<any[]>('/reminders/vehicle'),
};
