import { createCrudService, apiFetch } from './api';

// General Asset
export const generalAssetService = {
  ...createCrudService<any>('/general-assets'),
  getByCategory: (category: string) => apiFetch<any[]>(`/general-assets?category=${category}`),
  getHC: () => apiFetch<any[]>('/general-assets?category=HC'),
  getIT: () => apiFetch<any[]>('/general-assets?category=IT'),
  getCS: () => apiFetch<any[]>('/general-assets?category=CS'),
};

// Asset Mutation
export const assetMutationService = {
  ...createCrudService<any>('/asset-mutations'),
  getByAsset: (assetId: number) => apiFetch<any[]>(`/asset-mutations?assetId=${assetId}`),
};

// Asset Sale
export const assetSaleService = {
  ...createCrudService<any>('/asset-sales'),
  getByStatus: (status: string) => apiFetch<any[]>(`/asset-sales?status=${status}`),
};

// Asset Maintenance
export const assetMaintenanceService = {
  ...createCrudService<any>('/asset-maintenances'),
  getByAsset: (assetId: number) => apiFetch<any[]>(`/asset-maintenances?assetId=${assetId}`),
  getByCategory: (category: string) => apiFetch<any[]>(`/asset-maintenances?category=${category}`),
};

// Asset Reminders
export const assetReminderService = {
  getAll: () => apiFetch<any[]>('/reminders/asset'),
};
