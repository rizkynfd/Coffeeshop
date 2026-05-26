import { create } from 'zustand';
import { Product, Category } from '@/types';
import { DbProduct, DbCategory } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';

// ── Mappers (snake_case DB → camelCase TS) ──────────────────

function mapDbProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    description: row.description,
    image: row.image ?? undefined,
    variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants,
    hasTemperature: row.has_temperature,
    hasSugarLevel: row.has_sugar_level,
    hasMilkType: row.has_milk_type,
    availableModifiers:
      typeof row.available_modifiers === 'string'
        ? JSON.parse(row.available_modifiers)
        : row.available_modifiers,
    isAvailable: row.is_available,
    isPopular: row.is_popular,
    recipe: row.recipe
      ? typeof row.recipe === 'string'
        ? JSON.parse(row.recipe)
        : row.recipe
      : undefined,
  };
}

function mapDbCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    order: row.order,
  };
}

// ── Store ───────────────────────────────────────────────────

interface MenuState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;

  fetchMenuData: () => Promise<void>;

  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>()((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,

  fetchMenuData: async () => {
    set({ isLoading: true });
    try {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('order'),
        supabase.from('products').select('*').order('name'),
      ]);
      set({
        categories: (cats ?? []).map(mapDbCategory),
        products: (prods ?? []).map(mapDbProduct),
      });
    } catch (err) {
      console.error('fetchMenuData error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    const id = generateId();
    const row = {
      id,
      name: product.name,
      category_id: product.categoryId,
      description: product.description,
      image: product.image ?? null,
      variants: JSON.stringify(product.variants),
      has_temperature: product.hasTemperature,
      has_sugar_level: product.hasSugarLevel,
      has_milk_type: product.hasMilkType,
      available_modifiers: JSON.stringify(product.availableModifiers),
      is_available: product.isAvailable,
      is_popular: product.isPopular,
      recipe: product.recipe ? JSON.stringify(product.recipe) : null,
    };
    const { error } = await supabase.from('products').insert(row);
    if (error) { console.error('addProduct error:', error); return; }
    set((state) => ({ products: [...state.products, { ...product, id }] }));
  },

  updateProduct: async (id, updates) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.variants !== undefined) dbUpdates.variants = JSON.stringify(updates.variants);
    if (updates.hasTemperature !== undefined) dbUpdates.has_temperature = updates.hasTemperature;
    if (updates.hasSugarLevel !== undefined) dbUpdates.has_sugar_level = updates.hasSugarLevel;
    if (updates.hasMilkType !== undefined) dbUpdates.has_milk_type = updates.hasMilkType;
    if (updates.availableModifiers !== undefined) dbUpdates.available_modifiers = JSON.stringify(updates.availableModifiers);
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    if (updates.isPopular !== undefined) dbUpdates.is_popular = updates.isPopular;
    if (updates.recipe !== undefined) dbUpdates.recipe = updates.recipe ? JSON.stringify(updates.recipe) : null;

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
    if (error) { console.error('updateProduct error:', error); return; }
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { console.error('deleteProduct error:', error); return; }
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },

  toggleAvailability: async (id) => {
    const product = get().products.find((p) => p.id === id);
    if (!product) return;
    await get().updateProduct(id, { isAvailable: !product.isAvailable });
  },

  addCategory: async (category) => {
    const id = generateId();
    const { error } = await supabase.from('categories').insert({
      id,
      name: category.name,
      icon: category.icon,
      order: category.order,
    });
    if (error) { console.error('addCategory error:', error); return; }
    set((state) => ({ categories: [...state.categories, { ...category, id }] }));
  },

  updateCategory: async (id, updates) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) { console.error('updateCategory error:', error); return; }
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { console.error('deleteCategory error:', error); return; }
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },
}));
