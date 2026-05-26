// ============================================================
// Database Types — maps Supabase snake_case columns to TypeScript
// Generated manually based on Supabase schema
// ============================================================

export interface DbCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface DbProduct {
  id: string;
  name: string;
  category_id: string;
  description: string;
  image: string | null;
  variants: string; // JSON string: ProductVariant[]
  has_temperature: boolean;
  has_sugar_level: boolean;
  has_milk_type: boolean;
  available_modifiers: string; // JSON string: string[]
  is_available: boolean;
  is_popular: boolean;
  recipe: string | null; // JSON string: { stockItemId: string; amount: number }[]
}

export interface DbCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  loyalty_points: number;
  total_spent: number;
  total_orders: number;
  favorite_items: string; // JSON string: string[]
  joined_at: string;
  last_visit: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  type: string; // 'dine-in' | 'takeaway' | 'delivery'
  table_number: number | null;
  status: string; // OrderStatus
  items: string; // JSON string: OrderItem[]
  customer_id: string | null;
  customer_name: string | null;
  subtotal: number;
  discount: number;
  discount_label: string | null;
  tax: number;
  total: number;
  payments: string; // JSON string: Payment[]
  cashier_id: string;
  cashier_name: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DbInventory {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  last_restocked: string;
}

export interface DbShift {
  id: string;
  user_id: string;
  cashier_name: string;
  start_time: string;
  end_time: string | null;
  starting_cash: number;
  expected_cash: number;
  actual_cash: number | null;
  status: 'active' | 'closed';
  transactions: number;
  revenue: number;
}

export interface DbUser {
  id: string;
  name: string;
  username: string;
  role: string; // 'cashier' | 'supervisor' | 'owner'
  is_active: boolean;
}
