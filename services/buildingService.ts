import { createCrudService, apiFetch } from './api';

// Building
export const buildingService = {
  ...createCrudService<any>('/buildings'),
  getByType: (type: string) => apiFetch<any[]>(`/buildings?type=${type}`),
  getByStatus: (status: string) => apiFetch<any[]>(`/buildings?status=${status}`),
};

// Building Asset
export const buildingAssetService = {
  ...createCrudService<any>('/building-assets'),
  getByBuilding: (buildingId: number) => apiFetch<any[]>(`/building-assets?buildingId=${buildingId}`),
  getByType: (assetType: string) => apiFetch<any[]>(`/building-assets?assetType=${assetType}`),
};

// Building Maintenance
export const buildingMaintenanceService = {
  ...createCrudService<any>('/building-maintenances'),
  getByBuilding: (buildingId: number) => apiFetch<any[]>(`/building-maintenances?buildingId=${buildingId}`),
};

// Utility
export const utilityService = {
  ...createCrudService<any>('/utilities'),
  getByBuilding: (buildingId: number) => apiFetch<any[]>(`/utilities?buildingId=${buildingId}`),
  getByType: (type: string) => apiFetch<any[]>(`/utilities?type=${type}`),
};

// Compliance
export const complianceService = {
  ...createCrudService<any>('/compliances'),
  getByBuilding: (buildingId: number) => apiFetch<any[]>(`/compliances?buildingId=${buildingId}`),
  getByCategory: (category: string) => apiFetch<any[]>(`/compliances?category=${category}`),
};

// LogBook
export const logBookService = {
  ...createCrudService<any>('/logbooks'),
  getByBuilding: (buildingId: number) => apiFetch<any[]>(`/logbooks?buildingId=${buildingId}`),
};

// Building Reminders
export const buildingReminderService = {
  getAll: () => apiFetch<any[]>('/reminders/building'),
};
