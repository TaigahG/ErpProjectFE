import { create } from 'zustand';
import axios from 'axios';
import { AccountCategory, CreateAccountCategoryDTO } from '../types/accountCategory';

interface AccountCategoryStore {
  categories: AccountCategory[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: CreateAccountCategoryDTO) => Promise<void>;
  updateCategory: (id: number, category: Partial<AccountCategory>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

// const API_URL = 'https://erpprojectbe-production-f59b.up.railway.app/api/v1/financial/account-categories';

const API_URL = "http://127.0.0.1:8000/api/v1/financial/account-categories"


export const useAccountCategoryStore = create<AccountCategoryStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL);
      set({ categories: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch account categories', isLoading: false });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(API_URL, category);
      set((state) => ({
        categories: [...state.categories, response.data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to add account category', isLoading: false });
    }
  },

  updateCategory: async (id, category) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`${API_URL}/${id}`, category);
      set((state) => ({
        categories: state.categories.map(c => c.id === id ? response.data : c),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update account category', isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete account category', isLoading: false });
    }
  }
}));