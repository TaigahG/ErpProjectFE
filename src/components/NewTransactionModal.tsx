import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useInventoryStore } from '../store/inventoryStore';
import { CreateTransactionDTO } from '../types/transaction';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const indonesianRegions = [
  'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara',
  'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Palembang',
  'Bali', 'Yogyakarta', 'Tangerang', 'Bekasi', 'Depok',
  'Bogor', 'Malang', 'Padang', 'Pontianak', 'Banjarmasin',
  'Lampung', 'Aceh', 'Manado', 'Papua', 'Riau', 'Jambi'
];
  const [formData, setFormData] = useState<CreateTransactionDTO & { inventory_item_id?: number, quantity?: number }>({
    transaction_type: 'INCOME',
    amount: 0,
    category: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    region:'',
    notes: ''
  });
  
  const [useInventoryItem, setUseInventoryItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  const { addTransaction, isLoading } = useTransactionStore();
  const { items, fetchItems } = useInventoryStore();

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, fetchItems]);

  useEffect(() => {
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        setFormData(prev => ({
          ...prev,
          description: item.name,
          category: 'Inventory Sale',
          amount: item.price * itemQuantity,
          inventory_item_id: item.id,
          quantity: itemQuantity
        }));
      }
    }
  }, [selectedItemId, itemQuantity, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = { ...formData };
    
    if (!useInventoryItem) {
      delete transactionData.inventory_item_id;
      delete transactionData.quantity;
    }
    
    await addTransaction(transactionData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };
  
  const handleItemQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value, 10);
    setItemQuantity(quantity);
    
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        setFormData(prev => ({
          ...prev,
          amount: item.price * quantity,
          quantity
        }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Transaction</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            
            {formData.transaction_type === 'INCOME' && (
              <div className="border-t border-b py-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useInventoryItem}
                    onChange={(e) => setUseInventoryItem(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Use inventory item</span>
                </label>
                
                {useInventoryItem && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Item</label>
                      <select
                        value={selectedItemId || ''}
                        onChange={(e) => setSelectedItemId(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required={useInventoryItem}
                      >
                        <option value="">Select an item</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} - Rp {item.price.toLocaleString()} (In stock: {item.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        value={itemQuantity}
                        onChange={handleItemQuantityChange}
                        min="1"
                        max={selectedItemId ? items.find(i => i.id === selectedItemId)?.quantity || 1 : 1}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required={useInventoryItem}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a region</option>
                    {indonesianRegions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {(!useInventoryItem || formData.transaction_type === 'EXPENSE') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}
            
            {useInventoryItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <div className="mt-1 p-2 bg-gray-100 rounded border border-gray-300 text-gray-700">
                  Rp {formData.amount.toLocaleString()}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
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
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}