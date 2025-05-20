import { create } from 'zustand';
import axios from 'axios';

interface ProfitLoss {
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  revenue_breakdown: Array<{ category: string; amount: number }>;
  expenses_breakdown: Array<{ category: string; amount: number }>;
}

interface Prediction {
  prediction_date: string;
  predicted_amount: number;
  confidence_level: number;
  factors: string[];
}
interface AccountItem {
  category: string;
  code: string;
  parent_id: number | null;
  amount: number;
  children?: AccountItem[];
}

interface BalanceSheet {
  as_of_date: string;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  assets?: AccountItem[];
  liabilities?: AccountItem[];
  equity?: AccountItem[];
  assets_breakdown?: Array<{ category: string; amount: number }>;
  liabilities_breakdown?: Array<{ category: string; amount: number }>;
  equity_breakdown?: Array<{ category: string; amount: number }>;
}
interface ReportStore {
  profitLoss: ProfitLoss | null;
  predictions: Prediction[];
  isLoading: boolean;
  error: string | null;
  balanceSheet: BalanceSheet | null;
  fetchBalanceSheet: (asOfDate: string) => Promise<void>;
  fetchProfitLoss: (startDate: string, endDate: string) => Promise<void>;
  fetchPredictions: (monthsAhead: number) => Promise<void>;
}



const API_URL = 'https://erpprojectbe-production-f59b.up.railway.app/api/v1/reports';


export const useReportStore = create<ReportStore>((set) => ({
  profitLoss: null,
  predictions: [],
  isLoading: false,
  error: null,
  balanceSheet: null,

  
  fetchBalanceSheet: async (asOfDate: string) => {
  set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/balance-sheet`, {
        params: { as_of_date: asOfDate }
      });
      set({ balanceSheet: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch balance sheet', isLoading: false });
    }
  },
  fetchProfitLoss: async (startDate: string, endDate: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/profit-loss`, {
        params: { start_date: startDate, end_date: endDate }
      });
      set({ profitLoss: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch profit & loss report', isLoading: false });
    }
  },

  fetchPredictions: async (monthsAhead: number) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/revenue-prediction`, {
        params: { months_ahead: monthsAhead }
      });
      set({ predictions: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch predictions', isLoading: false });
    }
  },
}));