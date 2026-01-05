import { createCrudService, apiFetch } from './api';

// General Master
export const generalMasterService = {
  ...createCrudService<any>('/general-masters'),
  getByCategory: (category: string) => apiFetch<any[]>(`/general-masters/category/${category}`),
  bulkCreate: (data: any[]) => apiFetch<any>('/general-masters/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Master Categories
export const masterCategoryService = {
  ...createCrudService<any>('/master-categories'),
};

// Master Approval
export const masterApprovalService = {
  ...createCrudService<any>('/master-approvals'),
  getByModule: (module: string) => apiFetch<any[]>(`/master-approvals?module=${module}`),
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
