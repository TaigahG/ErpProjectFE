// src/components/BalanceSheet.tsx (Updated version)
import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import { ReportExporter } from './ReportExporter';
import { ReportHtmlExporter } from './ReportHtmlExporter';

export function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const { balanceSheet, isLoading, fetchBalanceSheet } = useReportStore();

  useEffect(() => {
    fetchBalanceSheet(asOfDate);
  }, [fetchBalanceSheet, asOfDate]);

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
        <div className="flex space-x-4">
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <div className="flex space-x-2">
            <ReportExporter reportType="balance-sheet" parameters={{ as_of_date: asOfDate }} />
            <ReportHtmlExporter reportType="balance-sheet-ifrs" parameters={{ as_of_date: asOfDate }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Balance Sheet as of {new Date(asOfDate).toLocaleDateString()}</h2>
        
        {balanceSheet ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Assets</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {balanceSheet.assets_breakdown.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 pl-4 text-gray-700">{item.category}</td>
                      <td className="py-2 pr-4 text-right">Rp {item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="py-2 pl-4">Total Assets</td>
                    <td className="py-2 pr-4 text-right">Rp {balanceSheet.total_assets.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Liabilities</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {balanceSheet.liabilities_breakdown.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 pl-4 text-gray-700">{item.category}</td>
                      <td className="py-2 pr-4 text-right">Rp {item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="py-2 pl-4">Total Liabilities</td>
                    <td className="py-2 pr-4 text-right">Rp {balanceSheet.total_liabilities.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Equity</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {balanceSheet.equity_breakdown.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 pl-4 text-gray-700">{item.category}</td>
                      <td className="py-2 pr-4 text-right">Rp {item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="py-2 pl-4">Total Equity</td>
                    <td className="py-2 pr-4 text-right">Rp {balanceSheet.total_equity.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="border-t-2 border-double pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Liabilities and Equity</span>
                <span>Rp {(balanceSheet.total_liabilities + balanceSheet.total_equity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">No balance sheet data available</div>
        )}
      </div>
    </div>
  );
}