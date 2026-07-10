export type UserRole = 'superAdmin' | 'officeAdmin' | 'accountant' | 'employee';

export interface User {
  id: number;
  name: string;
  username: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  monthly_salary?: number;
  is_driver?: boolean;
  vehicle_types?: string[];
}

export interface Tourist {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  nationality?: string;
  group_size: number;
  arrival_date?: string;
  departure_date?: string;
  notes?: string;
  packages?: TourPackage[];
}

export interface Property {
  id: number;
  name: string;
  type: 'hotel' | 'apartment' | 'villa' | 'house';
  price_per_night: number;
  location?: string;
  status: 'active' | 'inactive';
}

export interface Park {
  id: number;
  name: string;
  commission_amount: number;
  commission_rate?: number;
  location?: string;
  status: 'active' | 'inactive';
}

export interface Activity {
  id: number;
  name: string;
  default_price: number;
  status: 'active' | 'inactive';
}

export interface PackageItem {
  id?: number;
  item_type: 'accommodation' | 'transport' | 'activity' | 'sim';
  property_id?: number;
  activity_id?: number;
  park_id?: number;
  driver_id?: number;
  vehicle_type?: 'van' | 'bus' | 'vip';
  sim_included?: boolean;
  sim_cost?: number;
  price?: number;
  notes?: string;
}

export interface Payment {
  id?: number;
  amount: number;
  payment_date: string;
  notes?: string;
}

export interface TourPackage {
  id: number;
  tourist_id: number;
  assigned_employee_id?: number;
  package_price: number;
  people_count: number;
  status: string;
  notes?: string;
  tourist?: Tourist;
  assignedEmployee?: User;
  items?: PackageItem[];
  payments?: Payment[];
  logs?: PackageLog[];
}

export interface PackageLog {
  id: number;
  package_id: number;
  employee_id: number;
  accommodation_type?: string;
  property_id?: number;
  transport_type?: string;
  driver_id?: number;
  activity_ids?: number[];
  sim_included: boolean;
  sim_cost?: number;
  people_count: number;
  money_received: number;
  notes?: string;
  package?: TourPackage;
  created_at?: string;
}

export interface Handoff {
  id: number;
  package_id: number;
  office_admin_id: number;
  accountant_id?: number;
  amount_collected: number;
  status: 'pending' | 'received';
  sent_at: string;
  received_at?: string;
  notes?: string;
  package?: TourPackage;
  officeAdmin?: User;
  accountant?: User;
}

export interface PackageSpending {
  id: number;
  package_id: number;
  handoff_id?: number;
  accommodation_cost: number;
  transport_cost: number;
  activities_cost: number;
  sim_cost: number;
  park_commission: number;
  other_cost: number;
  notes?: string;
  package?: TourPackage;
}

export interface Expense {
  id: number;
  category: 'rent' | 'salaries' | 'other';
  amount: number;
  description?: string;
  expense_date: string;
}

export interface SalaryPayment {
  id: number;
  employee_id: number;
  amount: number;
  pay_period: string;
  paid_at: string;
  employee?: User;
}

export interface DashboardReport {
  month: string;
  revenue: number;
  operatingExpenses: number;
  packageCosts: number;
  totalExpenses: number;
  netProfit: number;
  touristsCount: number;
  packagesCount: number;
  pendingHandoffs: number;
}

export interface OfficeAdminReport {
  month: string;
  touristsReceived: number;
  packagesSold: number;
  totalPackageValue: number;
  moneyCollected: number;
  sentToAccountant: number;
}

export interface AccountantReport {
  month: string;
  handoffsReceived: number;
  pendingHandoffs: number;
  packageSpending: number;
  rent: number;
  salaries: number;
  otherExpenses: number;
  totalSpent: number;
}
