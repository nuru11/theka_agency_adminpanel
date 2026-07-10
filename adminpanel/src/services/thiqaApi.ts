import api from './api';
import type {
  User,
  Tourist,
  Property,
  Park,
  Activity,
  TourPackage,
  Handoff,
  PackageSpending,
  Expense,
  SalaryPayment,
  DashboardReport,
  OfficeAdminReport,
  AccountantReport,
  PackageLog,
} from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/login', { username, password }),
  me: () => api.get<{ success: boolean; data: User }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  list: () => api.get<{ success: boolean; data: User[] }>('/users'),
  listEmployees: () => api.get<{ success: boolean; data: User[] }>('/users/employees'),
  listDrivers: () => api.get<{ success: boolean; data: User[] }>('/users/drivers'),
  create: (data: Partial<User> & { password: string }) =>
    api.post<{ success: boolean; data: User }>('/users', data),
  update: (id: number, data: Partial<User> & { password?: string }) =>
    api.put<{ success: boolean; data: User }>(`/users/${id}`, data),
  remove: (id: number) => api.delete(`/users/${id}`),
};

export const propertyApi = {
  list: () => api.get<{ success: boolean; data: Property[] }>('/properties'),
  create: (data: Partial<Property>) => api.post('/properties', data),
  update: (id: number, data: Partial<Property>) => api.put(`/properties/${id}`, data),
  remove: (id: number) => api.delete(`/properties/${id}`),
};

export const parkApi = {
  list: () => api.get<{ success: boolean; data: Park[] }>('/parks'),
  create: (data: Partial<Park>) => api.post('/parks', data),
  update: (id: number, data: Partial<Park>) => api.put(`/parks/${id}`, data),
  remove: (id: number) => api.delete(`/parks/${id}`),
};

export const activityApi = {
  list: () => api.get<{ success: boolean; data: Activity[] }>('/activities'),
  create: (data: Partial<Activity>) => api.post('/activities', data),
  update: (id: number, data: Partial<Activity>) => api.put(`/activities/${id}`, data),
  remove: (id: number) => api.delete(`/activities/${id}`),
};

export const touristApi = {
  list: () => api.get<{ success: boolean; data: Tourist[] }>('/tourists'),
  get: (id: number) => api.get<{ success: boolean; data: Tourist }>(`/tourists/${id}`),
  create: (data: Partial<Tourist>) => api.post('/tourists', data),
  update: (id: number, data: Partial<Tourist>) => api.put(`/tourists/${id}`, data),
  remove: (id: number) => api.delete(`/tourists/${id}`),
};

export const packageApi = {
  list: (status?: string) =>
    api.get<{ success: boolean; data: TourPackage[] }>('/packages', { params: { status } }),
  get: (id: number) => api.get<{ success: boolean; data: TourPackage }>(`/packages/${id}`),
  create: (data: Record<string, unknown>) => api.post('/packages', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/packages/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch(`/packages/${id}/status`, { status }),
  addLog: (id: number, data: Record<string, unknown>) => api.post(`/packages/${id}/logs`, data),
  listLogs: () => api.get<{ success: boolean; data: PackageLog[] }>('/packages/logs/history'),
  remove: (id: number) => api.delete(`/packages/${id}`),
};

export const handoffApi = {
  list: (status?: string) =>
    api.get<{ success: boolean; data: Handoff[] }>('/handoffs', { params: { status } }),
  create: (data: { package_id: number; amount_collected?: number; notes?: string }) =>
    api.post('/handoffs', data),
  receive: (id: number) => api.patch(`/handoffs/${id}/receive`),
  markReady: (packageId: number) => api.post(`/handoffs/ready/${packageId}`),
};

export const packageSpendingApi = {
  list: () => api.get<{ success: boolean; data: PackageSpending[] }>('/package-spending'),
  create: (data: Partial<PackageSpending>) => api.post('/package-spending', data),
  update: (id: number, data: Partial<PackageSpending>) => api.put(`/package-spending/${id}`, data),
  remove: (id: number) => api.delete(`/package-spending/${id}`),
};

export const expenseApi = {
  list: () => api.get<{ success: boolean; data: Expense[] }>('/expenses'),
  create: (data: Partial<Expense>) => api.post('/expenses', data),
  update: (id: number, data: Partial<Expense>) => api.put(`/expenses/${id}`, data),
  remove: (id: number) => api.delete(`/expenses/${id}`),
};

export const salaryApi = {
  list: () => api.get<{ success: boolean; data: SalaryPayment[] }>('/salary-payments'),
  create: (data: { employee_id: number; pay_period: string; amount?: number; expense_date?: string }) =>
    api.post('/salary-payments', data),
};

export const reportApi = {
  dashboard: (month?: string) =>
    api.get<{ success: boolean; data: DashboardReport }>('/reports/dashboard', { params: { month } }),
  officeAdmin: (month?: string) =>
    api.get<{ success: boolean; data: OfficeAdminReport }>('/reports/office-admin', { params: { month } }),
  accountant: (month?: string) =>
    api.get<{ success: boolean; data: AccountantReport }>('/reports/accountant', { params: { month } }),
};
