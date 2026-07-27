import api, { postForm, getBlob } from './api';
import type {
  User,
  Tourist,
  Property,
  Park,
  Driver,
  TourPackage,
  CreatePackagePayload,
  Accountant,
  Handoff,
  WalletSummary,
  PackageSpending,
  ExchangeRate,
  FundReturn,
  MonthlyAnalysis,
  MasterStatus,
} from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/login', { username, password }),
  me: () => api.get<{ success: boolean; data: User }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const touristApi = {
  list: () => api.get<{ success: boolean; data: Tourist[] }>('/tourists'),
  get: (id: number) => api.get<{ success: boolean; data: Tourist }>(`/tourists/${id}`),
  create: (data: Partial<Tourist>) => api.post<{ success: boolean; data: Tourist }>('/tourists', data),
  update: (id: number, data: Partial<Tourist>) =>
    api.put<{ success: boolean; data: Tourist }>(`/tourists/${id}`, data),
  remove: (id: number) => api.delete<{ success: boolean; message: string }>(`/tourists/${id}`),
};

export const propertyApi = {
  list: () => api.get<{ success: boolean; data: Property[] }>('/properties'),
  get: (id: number) => api.get<{ success: boolean; data: Property }>(`/properties/${id}`),
  create: (data: Partial<Property>) => api.post<{ success: boolean; data: Property }>('/properties', data),
  update: (id: number, data: Partial<Property>) =>
    api.put<{ success: boolean; data: Property }>(`/properties/${id}`, data),
  remove: (id: number) => api.delete<{ success: boolean; message: string }>(`/properties/${id}`),
};

export const parkApi = {
  list: () => api.get<{ success: boolean; data: Park[] }>('/parks'),
  get: (id: number) => api.get<{ success: boolean; data: Park }>(`/parks/${id}`),
  create: (data: Partial<Park>) => api.post<{ success: boolean; data: Park }>('/parks', data),
  update: (id: number, data: Partial<Park>) =>
    api.put<{ success: boolean; data: Park }>(`/parks/${id}`, data),
  remove: (id: number) => api.delete<{ success: boolean; message: string }>(`/parks/${id}`),
};

export const driversApi = {
  list: () => api.get<{ success: boolean; data: Driver[] }>('/users/drivers'),
};

export const accountantsApi = {
  list: () => api.get<{ success: boolean; data: Accountant[] }>('/users/accountants'),
};

export type StaffPayload = {
  name: string;
  username: string;
  password?: string;
  phone?: string | null;
  role: 'officeAdmin' | 'accountant' | 'employee';
  status?: MasterStatus;
  monthly_salary?: number | null;
  is_driver?: boolean;
  vehicle_types?: string[] | null;
};

export const usersApi = {
  list: () => api.get<{ success: boolean; data: User[] }>('/users'),
  create: (data: StaffPayload) => api.post<{ success: boolean; data: User }>('/users', data),
  update: (id: number, data: Partial<StaffPayload>) =>
    api.put<{ success: boolean; data: User }>(`/users/${id}`, data),
  remove: (id: number) => api.delete<{ success: boolean; message: string }>(`/users/${id}`),
};

export const packageApi = {
  list: () => api.get<{ success: boolean; data: TourPackage[] }>('/packages'),
  get: (id: number) => api.get<{ success: boolean; data: TourPackage }>(`/packages/${id}`),
  create: (data: CreatePackagePayload) =>
    api.post<{ success: boolean; data: TourPackage }>('/packages', data),
  settle: (id: number, data: { action: 'keep' | 'return'; notes?: string | null }) =>
    api.post<{
      success: boolean;
      data: { package: TourPackage; fund_return: FundReturn | null };
    }>(`/packages/${id}/settle`, data),
};

export const handoffApi = {
  list: () => api.get<{ success: boolean; data: Handoff[] }>('/handoffs'),
  get: (id: number) => api.get<{ success: boolean; data: Handoff }>(`/handoffs/${id}`),
  create: (data: {
    package_id: number;
    amount: number;
    accountant_id: number;
    notes?: string | null;
  }) => api.post<{ success: boolean; data: Handoff }>('/handoffs', data),
  receive: (id: number) =>
    api.patch<{ success: boolean; data: Handoff }>(`/handoffs/${id}/receive`),
};

export const walletApi = {
  get: (userId?: number) =>
    api.get<{ success: boolean; data: WalletSummary }>(
      userId ? `/wallet?user_id=${userId}` : '/wallet'
    ),
};

export const packageSpendingApi = {
  list: () => api.get<{ success: boolean; data: PackageSpending[] }>('/package-spendings'),
  create: (formData: FormData) =>
    postForm<{ success: boolean; data: PackageSpending }>('/package-spendings', formData),
  screenshot: (id: number) => getBlob(`/package-spendings/${id}/screenshot`),
};

export const exchangeRateApi = {
  get: () => api.get<{ success: boolean; data: ExchangeRate | null }>('/exchange-rate'),
  set: (usd_to_etb: number) =>
    api.post<{ success: boolean; data: ExchangeRate }>('/exchange-rate', { usd_to_etb }),
};

export const fundReturnApi = {
  list: () => api.get<{ success: boolean; data: FundReturn[] }>('/fund-returns'),
  create: (data: { amount_usd: number; package_id?: number | null; notes?: string | null }) =>
    api.post<{ success: boolean; data: FundReturn }>('/fund-returns', data),
  receive: (id: number) =>
    api.patch<{ success: boolean; data: FundReturn }>(`/fund-returns/${id}/receive`),
};

export const reportsApi = {
  monthly: (period: string) =>
    api.get<{ success: boolean; data: MonthlyAnalysis }>(`/reports/monthly?period=${period}`),
};
