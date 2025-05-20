import React, { useEffect, useState } from 'react';
import { useReportStore } from '../store/reportStore';
import { ReportExporter } from './ReportExporter';
import { ReportHtmlExporter } from './ReportHtmlExporter';

interface AccountItem {
  category: string;
  code: string;
  parent_id: number | null;
  amount: number;
  children?: AccountItem[];
}

const RenderAccountTree = ({ accounts, level = 0 }: { accounts: AccountItem[], level?: number }) => {
  return (
    <>
      {accounts.map((item, index) => (
        <React.Fragment key={`${item.code}-${index}`}>
          <tr className="border-b">
            <td 
              className="py-2 pl-4 text-gray-700" 
              style={{ paddingLeft: `${level * 20 + 16}px` }}
            >
              {item.code} - {item.category}
            </td>
            <td className="py-2 pr-4 text-right">
              Rp {item.amount.toLocaleString()}
            </td>
          </tr>
          {item.children && item.children.length > 0 && (
            <RenderAccountTree accounts={item.children} level={level + 1} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export function BalanceSheet() {
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const { balanceSheet, isLoading, fetchBalanceSheet } = useReportStore();



    useEffect(() => {
    fetchBalanceSheet(asOfDate);
    }, [fetchBalanceSheet, asOfDate]);

    const formatCurrency = (value: number | string) => {
    return Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    };


    if (isLoading) return <div className="p-6">Loading...</div>;

    const hasBalanceSheet = balanceSheet && 
    typeof balanceSheet.total_assets !== 'undefined' &&
    typeof balanceSheet.total_liabilities !== 'undefined' &&
    typeof balanceSheet.total_equity !== 'undefined';

    const formattedDate = new Date(asOfDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
    });

    const totalLiabilitiesAndEquity = hasBalanceSheet 
    ? Number(balanceSheet.total_liabilities || 0) + Number(balanceSheet.total_equity || 0)
    : 0;

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
            <ReportExporter reportType="balance-sheet-ifrs" parameters={{ as_of_date: asOfDate }} />
            <ReportHtmlExporter reportType="balance-sheet-ifrs" parameters={{ as_of_date: asOfDate }} />
            </div>
        </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Balance Sheet as of {formattedDate}</h2>
        
        {hasBalanceSheet ? (
            <div className="space-y-6">
            {/* ASSETS SECTION */}
            <div>
                <h3 className="text-lg font-medium mb-2">Assets</h3>
                <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                    {balanceSheet.assets && balanceSheet.assets.length > 0 ? (
                    <RenderAccountTree accounts={balanceSheet.assets} />
                    ) : balanceSheet.assets_breakdown && balanceSheet.assets_breakdown.length > 0 ? (
                    balanceSheet.assets_breakdown.map((item, index) => (
                        <tr key={index} className="border-b">
                        <td className="py-2 pl-4 text-gray-700">{item.category}</td>
                        <td className="py-2 pr-4 text-right">Rp {item.amount.toLocaleString()}</td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                    </tr>
                    )}
                    <tr className="font-bold bg-gray-50">
                    <td className="py-2 pl-4">Total Assets</td>
                    <td className="py-2 pr-4 text-right">Rp {balanceSheet.total_assets.toLocaleString()}</td>
                    </tr>
                </tbody>
                </table>
            </div>
            
            {/* LIABILITIES SECTION */}
            <div>
                <h3 className="text-lg font-medium mb-2">Liabilities</h3>
                <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                    {balanceSheet.liabilities && balanceSheet.liabilities.length > 0 ? (
                    <RenderAccountTree accounts={balanceSheet.liabilities} />
                    ) : balanceSheet.liabilities_breakdown && balanceSheet.liabilities_breakdown.length > 0 ? (
                    balanceSheet.liabilities_breakdown.map((item, index) => (
                        <tr key={index} className="border-b">
                        <td className="py-2 pl-4 text-gray-700">{item.category}</td>
                        <td className="py-2 pr-4 text-right">Rp {item.amount.toLocaleString()}</td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                    </tr>
                    )}
                    <tr className="font-bold bg-gray-50">
                    <td className="py-2 pl-4">Total Liabilities</td>
                    <td className="py-2 pr-4 text-right">Rp {balanceSheet.total_liabilities.toLocaleString()}</td>
                    </tr>
                </tbody>
                </table>
            </div>
            
            {/* EQUITY SECTION */}
            <div>
                <h3 className="text-lg font-medium mb-2">Equity</h3>
                <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                    {balanceSheet.equity && balanceSheet.equity.length > 0 ? (
                    <RenderAccountTree accounts={balanceSheet.equity} />
                    ) : balanceSheet.equity_breakdown && balanceSheet.equity_breakdown.length > 0 ? (
                    balanceSheet.equity_breakdown.map((item, index) => (
                        <tr key={index} className="border-b">
                        <td className="py-2 pl-4 text-gray-700">{item.category}</td>
                        <td className="py-2 pr-4 text-right">Rp {item.amount.toLocaleString()}</td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                    </tr>
                    )}
                    <tr className="font-bold bg-gray-50">
                    <td className="py-2 pl-4">Total Equity</td>
                    <td className="py-2 pr-4 text-right">Rp {balanceSheet.total_equity.toLocaleString()}</td>
                    </tr>
                </tbody>
                </table>
            </div>
            
            {/* TOTAL LIABILITIES AND EQUITY */}
            <div className="border-t-2 border-double pt-4">
                <div className="flex justify-between font-bold text-lg">
                <span>Total Liabilities and Equity</span>
                <span>Rp {formatCurrency(totalLiabilitiesAndEquity)}</span>
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