import { create } from 'zustand';
import axios from 'axios';

interface DashboardData {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  previous_income: number;
  previous_expenses: number;
  previous_profit: number;
  monthly_data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

interface DashboardStore {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (period: '30d' | '90d' | 'year') => Promise<void>;
}

const API_URL = 'https://erpprojectbe-production-f59b.up.railway.app/api/v1/reports';

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async (period) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/dashboard`, {
        params: { period }
      });
      set({ data: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard data', isLoading: false });
    }
  },
}));