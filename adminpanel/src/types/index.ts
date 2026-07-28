export type UserRole = 'superAdmin' | 'officeAdmin' | 'accountant' | 'employee';

export type TouristStatus = 'expected' | 'received' | 'departed' | 'cancelled';

export type PropertyType = 'hotel' | 'apartment' | 'villa';

export type MasterStatus = 'active' | 'inactive';

export interface User {
  id: number;
  name: string;
  username: string;
  phone?: string;
  role: UserRole;
  status: MasterStatus;
  monthly_salary?: number;
  is_driver?: boolean;
  vehicle_types?: string[];
}

export interface Tourist {
  id: number;
  name: string;
  phone?: string | null;
  nationality?: string | null;
  come_date?: string | null;
  leave_date?: string | null;
  status: TouristStatus;
  amount_received: number;
  created_by: number;
  creator?: { id: number; name: string };
}

export interface Property {
  id: number;
  name: string;
  type: PropertyType;
  location?: string | null;
  city: string;
  price: number;
  commission: number;
  status: MasterStatus;
}

export interface Park {
  id: number;
  name: string;
  city: string;
  price: number;
  status: MasterStatus;
}

export interface Expense {
  id: number;
  name: string;
  price: number;
  status: MasterStatus;
}

export interface PackageExpense {
  id?: number;
  expense_id: number;
  price: number;
  expense?: { id: number; name: string; price?: number };
}

export type VehicleType = 'van' | 'bus' | 'vip';

export type PackageStatus =
  | 'draft'
  | 'active'
  | 'ready_for_handoff'
  | 'sent_to_accountant'
  | 'accountant_received'
  | 'settled'
  | 'done';

export interface Driver {
  id: number;
  name: string;
  phone?: string | null;
  vehicle_types?: string[] | null;
}

export interface PackageDay {
  id?: number;
  day_number: number;
  park_id: number;
  park_price: number;
  property_id: number;
  accommodation_price: number;
  driver_id: number;
  park?: { id: number; name: string; price?: number };
  property?: { id: number; name: string; price?: number };
  driver?: { id: number; name: string };
}

export interface TourPackage {
  id: number;
  tourist_id: number;
  people_count: number;
  days_count: number;
  property_id: number;
  accommodation_price: number;
  driver_id: number;
  vehicle_type: VehicleType;
  expected_cost: number;
  actual_spend?: number;
  actual_spend_usd?: number;
  /** Overspend (actual − expected) in USD */
  variance?: number;
  variance_etb?: number;
  /** amount_received (USD) − actual_spend converted to USD */
  net_profit?: number;
  remaining_usd?: number;
  status: PackageStatus;
  created_by: number;
  tourist?: { id: number; name: string; amount_received?: number };
  property?: { id: number; name: string };
  driver?: { id: number; name: string };
  creator?: { id: number; name: string };
  days?: PackageDay[];
  expenses?: PackageExpense[];
  spendings?: PackageSpending[];
}

export interface CreatePackagePayload {
  tourist_id: number;
  people_count: number;
  days_count: number;
  driver_id: number;
  vehicle_type: VehicleType;
  days: Array<{
    day_number: number;
    park_id: number;
    park_price: number;
    property_id: number;
    accommodation_price: number;
    driver_id: number;
  }>;
  expenses?: Array<{
    expense_id: number;
    price: number;
  }>;
}

export type HandoffStatus = 'pending' | 'received';

export interface Accountant {
  id: number;
  name: string;
  phone?: string | null;
  username?: string;
}

export interface Handoff {
  id: number;
  package_id: number;
  office_admin_id: number;
  accountant_id: number;
  amount: number;
  exchange_rate?: number | null;
  amount_etb?: number | null;
  status: HandoffStatus;
  sent_at: string;
  received_at?: string | null;
  notes?: string | null;
  package?: {
    id: number;
    expected_cost?: number;
    status?: PackageStatus;
    tourist_id?: number;
    tourist?: { id: number; name: string };
  };
  officeAdmin?: { id: number; name: string };
  accountant?: { id: number; name: string };
}

export interface WalletTransaction {
  id: number;
  user_id: number;
  type: 'credit' | 'debit';
  amount: number;
  amount_usd?: number | null;
  amount_etb?: number | null;
  exchange_rate?: number | null;
  handoff_id?: number | null;
  package_spending_id?: number | null;
  fund_return_id?: number | null;
  note?: string | null;
  created_at: string;
}

export interface WalletSummary {
  balance: number;
  balance_usd: number;
  balance_etb: number;
  transactions: WalletTransaction[];
}

export interface ExchangeRate {
  id: number;
  usd_to_etb: number;
  set_by: number;
  created_at?: string;
  setter?: { id: number; name: string };
}

export type FundReturnStatus = 'pending' | 'received';

export interface FundReturn {
  id: number;
  accountant_id: number;
  package_id?: number | null;
  amount_usd: number;
  amount_etb: number;
  exchange_rate: number;
  status: FundReturnStatus;
  notes?: string | null;
  sent_at: string;
  received_at?: string | null;
  received_by?: number | null;
  package?: {
    id: number;
    expected_cost?: number;
    status?: PackageStatus;
    tourist_id?: number;
    tourist?: { id: number; name: string };
  } | null;
  accountant?: { id: number; name: string };
  receiver?: { id: number; name: string } | null;
}

export type BuiltinSpendingReason = 'accommodation' | 'park' | 'food' | 'other';
export type SpendingReason = string;

export interface PackageSpending {
  id: number;
  package_id: number;
  amount: number;
  reason: SpendingReason;
  screenshot_path: string;
  notes?: string | null;
  created_by: number;
  created_at?: string;
  package?: {
    id: number;
    expected_cost?: number;
    status?: PackageStatus;
    tourist_id?: number;
    tourist?: { id: number; name: string };
  };
  creator?: { id: number; name: string };
}

export type ExpenseByReason = Record<BuiltinSpendingReason, number>;

export interface MonthlyAnalysisTouristRow {
  tourist_id: number;
  name: string;
  come_date: string;
  income: number;
  expected_spend: number;
  expected_spend_etb: number;
  expected_income: number;
  expense: number;
  expense_etb: number;
  profit: number;
}

export interface MonthlyAnalysisDayRow {
  date: string;
  income: number;
  expected_spend: number;
  expected_income: number;
  expense: number;
  net: number;
}

export interface MonthlyAnalysis {
  period: string;
  period_label: string;
  income: number;
  expense: number;
  expense_etb: number;
  expected_spend: number;
  expected_spend_etb: number;
  expected_income: number;
  net_profit: number;
  tourist_count: number;
  expense_by_reason: ExpenseByReason;
  expense_etb_by_reason: ExpenseByReason;
  by_tourist: MonthlyAnalysisTouristRow[];
  by_day: MonthlyAnalysisDayRow[];
}
