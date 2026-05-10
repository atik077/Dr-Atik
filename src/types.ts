
export type Category = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup' 
  | 'Suspension' 
  | 'Drops' 
  | 'Injection' 
  | 'Ointment' 
  | 'Cream' 
  | 'Gel' 
  | 'Lotion' 
  | 'Eye Drop' 
  | 'Ear Drop' 
  | 'Nasal Spray' 
  | 'Inhaler' 
  | 'Suppository' 
  | 'IV Fluid' 
  | 'Other';

export interface Customer {
  id: string;
  name: string;
  fathersName: string;
  mobile: string;
  address: string;
  dueBalance: number;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  category: Category;
  description: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  expiryDate: string;
  supplierName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'Credit';
  customerId?: string;
  customerName?: string;
  date: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  type: 'SALE' | 'PAYMENT';
  date: string;
  amount: number;
  paymentMethod: string;
  referenceId?: string; // Sale ID or custom receipt ID
  note?: string;
}

export interface Purchase {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
  supplierName: string;
  date: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  lowStockCount: number;
  expiredCount: number;
  recentSales: Sale[];
}

export interface ChiefComplaint {
  id: string;
  value: string;
  createdAt: string;
}

export interface ExaminationFinding {
  id: string;
  value: string;
  createdAt: string;
}
