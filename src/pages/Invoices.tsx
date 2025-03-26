import React, { useState, useEffect } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { useInvoiceStore } from '../store/invoiceStore';
import { NewInvoiceModal } from '../components/NewInvoiceModal';
import axios from 'axios';

export function Invoices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { invoices, fetchInvoices, isLoading } = useInvoiceStore();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/invoice/invoices/${invoiceId}/pdf`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Invoice
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading invoices...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.client_name}</div>
                    <div className="text-sm text-gray-500">{invoice.client_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <div className="text-gray-900">
                      {invoice.currency} {invoice.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Tax: {invoice.currency} {invoice.tax_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDownloadPDF(invoice.id);
                      }}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!isLoading && invoices.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No invoices found. Create your first invoice!
          </div>
        )}
      </div>

      <NewInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}