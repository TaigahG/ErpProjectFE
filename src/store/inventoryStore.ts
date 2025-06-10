// src/store/inventoryStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { InventoryItem, CreateInventoryItemDTO, UpdateInventoryItemDTO } from '../types/inventory';

interface InventoryStore {
  items: InventoryItem[];
  analytics: any | null;
  isLoading: boolean;
  error: string | null;
  fetchItems: (search?: string) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  addItem: (item: CreateInventoryItemDTO) => Promise<void>;
  updateItem: (id: number, item: UpdateInventoryItemDTO) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

// const API_URL = 'http://127.0.0.1:8000/api/v1/inventory';
const API_URL = 'https://erpprojectbe-production-f59b.up.railway.app/api/v1/inventory';

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  analytics: null,
  isLoading: false,
  error: null,

  fetchItems: async (search?: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(API_URL, { params: { search } });
      set({ items: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch inventory items', isLoading: false });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/analysis`);
      set({ analytics: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch inventory analytics', isLoading: false });
    }
  },

  addItem: async (item) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(API_URL, item);
      set((state) => ({
        items: [...state.items, response.data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to add inventory item', isLoading: false });
    }
  },

  updateItem: async (id, item) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`${API_URL}/${id}`, item);
      set((state) => ({
        items: state.items.map(i => i.id === id ? response.data : i),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update inventory item', isLoading: false });
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        items: state.items.filter(i => i.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete inventory item', isLoading: false });
    }
  }
}));