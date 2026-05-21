import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category } from '@/types';
import { products as mockProducts, categories as mockCategories } from '@/data/mock-products';
import { generateId } from '@/lib/utils';

interface MenuState {
  products: Product[];
  categories: Category[];

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleAvailability: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      products: mockProducts,
  categories: mockCategories,

  addProduct: (product) => {
    const newProduct: Product = { ...product, id: generateId() };
    set((state) => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  toggleAvailability: (id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
      ),
    }));
  },

  addCategory: (category) => {
    const newCategory: Category = { ...category, id: generateId() };
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
    }),
    {
      name: 'menu-storage',
    }
  )
);

