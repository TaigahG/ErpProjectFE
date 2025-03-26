import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardStore } from '../store/dashboardStore';

export function Dashboard() {
  const [period, setPeriod] = useState<'30d' | '90d' | 'year'>('30d');
  const { data, isLoading, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData(period);
  }, [fetchDashboardData, period]);

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <div className="flex space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as '30d' | '90d' | 'year')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Income</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            Rp {data?.total_income.toLocaleString() ?? 0}
          </p>
          <p className="text-sm text-gray-500">
            {getPercentageChange(
              data?.total_income ?? 0,
              data?.previous_income ?? 0
            ).toFixed(1)}% from previous period
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            Rp {data?.total_expenses.toLocaleString() ?? 0}
          </p>
          <p className="text-sm text-gray-500">
            {getPercentageChange(
              data?.total_expenses ?? 0,
              data?.previous_expenses ?? 0
            ).toFixed(1)}% from previous period
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Net Profit</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            Rp {data?.net_profit.toLocaleString() ?? 0}
          </p>
          <p className="text-sm text-gray-500">
            {getPercentageChange(
              data?.net_profit ?? 0,
              data?.previous_profit ?? 0
            ).toFixed(1)}% from previous period
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthly_data ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `Rp ${(value/1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value) => `Rp ${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}