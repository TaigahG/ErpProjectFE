export interface InventoryItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    quantity: number;
    created_at: string;
    updated_at: string | null;
  }
  
  export type CreateInventoryItemDTO = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;
  export type UpdateInventoryItemDTO = Partial<CreateInventoryItemDTO>;
  
  export interface InventoryAnalytics {
    top_selling_items: InventoryItemAnalysis[];
    items_to_restock: InventoryItemAnalysis[];
    growth_items: InventoryItemAnalysis[];
    all_items_analysis: InventoryItemAnalysis[];
  }
  
  export interface InventoryItemAnalysis {
    id: number;
    name: string;
    current_stock: number;
    total_sold: number;
    total_revenue: number;
    predicted_monthly_sales: number;
    growth_rate: number;
    turnover_rate: number;
    prediction_confidence: number;
    revenue_impact: number;
    restock_recommendation: 'High' | 'Medium' | 'Low';
  }
