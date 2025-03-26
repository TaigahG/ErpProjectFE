export interface ProfitLossReport {
    period_start: string;
    period_end: string;
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    revenue_breakdown: Array<{
      date: string | number | Date; category: string; amount: number 
}>;
    expenses_breakdown: Array<{
      date: string | number | Date; category: string; amount: number 
}>;
  }
  
  export interface RevenuePrediction {
    prediction_date: string;
    predicted_amount: number;
    confidence_level: number;
    factors: string[];
  }