import { createCrudService, apiFetch } from './api';

export const timesheetService = {
  ...createCrudService<any>('/timesheets'),
  getByEmployee: (employeeId: number) => apiFetch<any[]>(`/timesheets?employeeId=${employeeId}`),
  getByDate: (date: string) => apiFetch<any[]>(`/timesheets?date=${date}`),
  getByStatus: (status: string) => apiFetch<any[]>(`/timesheets?status=${status}`),
};
