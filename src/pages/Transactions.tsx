import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Pencil } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { NewTransactionModal } from '../components/NewTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { Transaction } from '../types/transaction';


export function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);


  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Transaction
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.transaction_type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transaction_type.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span className={transaction.transaction_type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                      Rp {transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            
        )}
      </div>

      <NewTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </div>
  );
}