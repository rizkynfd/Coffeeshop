// ============================================================
// Product & Menu Types
// ============================================================

export type ProductSize = 'small' | 'medium' | 'large';
export type Temperature = 'hot' | 'iced';
export type SugarLevel = 'normal' | 'less' | 'no-sugar';
export type MilkType = 'regular' | 'oat' | 'almond' | 'soy';

export interface Modifier {
  id: string;
  name: string;
  price: number;
  category: 'topping' | 'extra' | 'milk' | 'other';
}

export interface ProductVariant {
  size: ProductSize;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  image?: string;
  variants: ProductVariant[];
  hasTemperature: boolean;
  hasSugarLevel: boolean;
  hasMilkType: boolean;
  availableModifiers: string[];
  isAvailable: boolean;
  isPopular: boolean;
  recipe?: {
    stockItemId: string;
    amount: number;
  }[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

// ============================================================
// Order Types
// ============================================================

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled';

export interface OrderItemModifier {
  modifierId: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  size: ProductSize;
  temperature?: Temperature;
  sugarLevel?: SugarLevel;
  milkType?: MilkType;
  modifiers: OrderItemModifier[];
  notes: string;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableNumber?: number;
  status: OrderStatus;
  items: OrderItem[];
  customerId?: string;
  customerName?: string;
  subtotal: number;
  discount: number;
  discountLabel?: string;
  tax: number;
  total: number;
  payments: Payment[];
  cashierId: string;
  cashierName: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============================================================
// Payment Types
// ============================================================

export type PaymentMethodType = 'cash' | 'qris' | 'debit' | 'e-wallet';

export interface Payment {
  id: string;
  method: PaymentMethodType;
  amount: number;
  reference?: string;
}

// ============================================================
// Customer & Loyalty Types
// ============================================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  favoriteItems: string[];
  joinedAt: string;
  lastVisit: string;
}

// ============================================================
// Inventory / Stock Types
// ============================================================

export type StockMovementType = 'in' | 'out' | 'waste' | 'adjustment';

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  lastRestocked: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: StockMovementType;
  quantity: number;
  notes: string;
  recordedBy: string;
  recordedAt: string;
}

// ============================================================
// User & Auth Types
// ============================================================

export type UserRole = 'cashier' | 'supervisor' | 'owner';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

// ============================================================
// Shift Types
// ============================================================

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCash?: number;
  totalSales: number;
  totalTransactions: number;
  isActive: boolean;
}

// ============================================================
// UI / Cart Types (for Zustand store)
// ============================================================

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  size: ProductSize;
  temperature?: Temperature;
  sugarLevel?: SugarLevel;
  milkType?: MilkType;
  modifiers: OrderItemModifier[];
  notes: string;
  unitPrice: number;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  label: string;
}
