import { createCrudService, apiFetch } from './api';

export const userService = {
  ...createCrudService<any>('/users'),
  getByRole: (role: string) => apiFetch<any[]>(`/users?role=${role}`),
  getByDepartment: (department: string) => apiFetch<any[]>(`/users?department=${department}`),
  getByBranch: (branch: string) => apiFetch<any[]>(`/users?branch=${branch}`),
  getActive: () => apiFetch<any[]>('/users?status=Active'),
  search: (query: string) => apiFetch<any[]>(`/users?search=${query}`),
};
