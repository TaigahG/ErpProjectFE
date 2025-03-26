import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { useTransactionStore } from '../store/transactionStore';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const [formData, setFormData] = useState<Partial<Transaction>>({});
  const { updateTransaction, isLoading } = useTransactionStore();
  const formatDateForInput = (date: string) => {
    return new Date(date).toISOString().split('T')[0];
    };
  const indonesianRegions = [
    'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara',
    'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Palembang',
    'Bali', 'Yogyakarta', 'Tangerang', 'Bekasi', 'Depok',
    'Bogor', 'Malang', 'Padang', 'Pontianak', 'Banjarmasin',
    'Lampung', 'Aceh', 'Manado', 'Papua', 'Riau', 'Jambi'
  ];

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    }
  }, [transaction]);
  useEffect(() => {
    if (transaction) {
        setFormData({
            ...transaction,
            transaction_date: formatDateForInput(transaction.transaction_date)
        });
    }
    }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction?.id && formData) {
      await updateTransaction(transaction.id, formData);
      onClose();
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Transaction</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_type: e.target.value as 'INCOME' | 'EXPENSE' }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        transaction_date: e.target.value 
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a region</option>
                    {indonesianRegions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}