import React, { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReportStore } from '../store/reportStore';

export function Reports() {
  const [dateRange, setDateRange] = useState('thisYear');
  const { profitLoss, predictions, isLoading, fetchProfitLoss, fetchPredictions } = useReportStore();

  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
    
    fetchProfitLoss(startDate, endDate);
    fetchPredictions(3);
  }, [fetchProfitLoss, fetchPredictions]);

  const chartData = useMemo(() => {
    if (!profitLoss) return [];

    const monthlyData = profitLoss.revenue_breakdown.reduce((acc, item) => {
        const date = new Date(item.category);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!acc[monthKey]) {
            acc[monthKey] = {
                month: monthKey,
                revenue: 0,
                expenses: 0,
                profit: 0
            };
        }
        
        acc[monthKey].revenue += item.amount;
        
        const monthExpense = profitLoss.expenses_breakdown.find(
            e => new Date(e.category).getMonth() === date.getMonth() &&
                new Date(e.category).getFullYear() === date.getFullYear()
        )?.amount ?? 0;
        
        acc[monthKey].expenses = monthExpense;
        acc[monthKey].profit = acc[monthKey].revenue - monthExpense;
        
        return acc;
    }, {} as Record<string, { month: string; revenue: number; expenses: number; profit: number }>);

    const historicalData = Object.values(monthlyData)
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const recentHistoricalData = historicalData.slice(-4);

    const predictionsData = predictions?.map(pred => ({
        month: new Date(pred.prediction_date).toLocaleDateString('en-US', { 
            month: 'short',
            year: 'numeric'
        }) + ' (Pred)',
        revenue: pred.predicted_amount,
        expenses: null,
        profit: null
    })) ?? [];

    return [...recentHistoricalData, ...predictionsData];
}, [profitLoss, predictions]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <div className="flex space-x-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="thisYear">This Year</option>
            <option value="lastYear">Last Year</option>
            <option value="customRange">Custom Range</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profit & Loss Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-green-600 font-medium">
                Rp {profitLoss?.total_revenue?.toLocaleString() ?? '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expenses</span>
              <span className="text-red-600 font-medium">
                Rp {profitLoss?.total_expenses?.toLocaleString() ?? '0'}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Net Profit</span>
                <span className={(profitLoss?.net_profit ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'}>
                  Rp {profitLoss?.net_profit?.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Predictions</h2>
          <div className="space-y-4">
            {predictions?.map((prediction, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">
                  {new Date(prediction.prediction_date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span className="font-medium">
                  Rp {prediction.predicted_amount.toLocaleString()}
                  <span className="text-xs text-gray-500 ml-2">
                    ({(prediction.confidence_level * 100).toFixed(0)}% confidence)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Financial Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `Rp ${(value/1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value) => value ? `Rp ${value.toLocaleString()}` : '-'} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                name="Revenue" 
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                name="Expenses" 
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3B82F6" 
                name="Profit" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}