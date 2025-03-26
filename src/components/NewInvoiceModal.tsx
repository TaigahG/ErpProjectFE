import React, { useState, useEffect } from 'react';
import { X, Plus, Trash, FileText, FileCheck } from 'lucide-react';
import { useInvoiceStore } from '../store/invoiceStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useTransactionStore } from '../store/transactionStore';
import { InvoiceItem, CreateInvoiceDTO } from '../types/invoice';
import { Transaction } from '../types/transaction';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInvoiceModal({ isOpen, onClose }: NewInvoiceModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'transactions'>('manual');
  
  const [formData, setFormData] = useState<Partial<CreateInvoiceDTO>>({
    client_name: '',
    client_email: '',
    client_address: '',
    payment_terms: 'NET_30',
    currency: 'IDR',
    tax_rate: 10.00,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [],
    transaction_ids: []
  });

  const [useInventoryForItem, setUseInventoryForItem] = useState<boolean[]>([]);
  
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  
  const { addInvoice, isLoading } = useInvoiceStore();
  const { items: inventoryItems, fetchItems } = useInventoryStore();
  const { transactions, fetchTransactions, isLoading: isLoadingTransactions } = useTransactionStore();

  const incomeTransactions = transactions.filter(t => t.transaction_type === 'INCOME');

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchTransactions();
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      setFormData(prev => ({
        ...prev,
        due_date: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [isOpen, fetchItems, fetchTransactions]);

  useEffect(() => {
    if (activeTab === 'transactions' && selectedTransactions.length > 0) {
      const selectedTransactionObjects = transactions.filter(t => 
        selectedTransactions.includes(t.id)
      );
      
      const subtotal = Number(selectedTransactionObjects.reduce((sum, t) => sum + t.amount, 0));
      const taxAmount = Number((subtotal * (formData.tax_rate || 10) / 100).toFixed(2));
      const total = Number((subtotal + taxAmount).toFixed(2));
      
      setFormData(prev => ({
        ...prev,
        transaction_ids: selectedTransactions,
        subtotal,
        tax_amount: taxAmount,
        total
      }));
    }
  }, [selectedTransactions, transactions, formData.tax_rate, activeTab]);

  const toggleTransaction = (transactionId: number) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          amount: 0,
        },
      ],
    }));
    setUseInventoryForItem([...useInventoryForItem, false]);
  };

  const handleInventoryItemSelect = (index: number, itemId: number) => {
    const inventoryItem = inventoryItems.find(item => item.id === Number(itemId));
    
    if (inventoryItem && formData.items) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        description: inventoryItem.name,
        unit_price: inventoryItem.price,
        amount: inventoryItem.price * newItems[index].quantity,
        inventory_item_id: inventoryItem.id
      };

      updateTotals(newItems);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    if (!formData.items) return;
    
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }

    updateTotals(newItems);
  };

  const updateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax_amount = subtotal * (formData.tax_rate || 0) / 100;
    const total = subtotal + tax_amount;

    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      tax_amount,
      total,
    }));
  };

  const removeItem = (index: number) => {
    if (!formData.items) return;
    
    const newItems = formData.items.filter((_, i) => i !== index);
    const newUseInventoryForItem = useInventoryForItem.filter((_, i) => i !== index);
    
    updateTotals(newItems);
    setUseInventoryForItem(newUseInventoryForItem);
  };

  const switchTab = (tab: 'manual' | 'transactions') => {
    setActiveTab(tab);
    if (tab === 'manual') {
      setFormData(prev => ({
        ...prev,
        transaction_ids: [],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [],
      }));
      setUseInventoryForItem([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const cleanData = {
    client_name: formData.client_name || "",
    client_email: formData.client_email || "placeholder@example.com",
    client_address: formData.client_address || "",
    payment_terms: formData.payment_terms,
    currency: formData.currency,
    tax_rate: Number(formData.tax_rate),
    due_date: formData.due_date,
    notes: formData.notes || "",
    items: formData.items || [],
    transaction_ids: formData.transaction_ids || []
  };
  
  if (activeTab === 'manual') {
    cleanData.items = formData.items || [];
    cleanData.transaction_ids = [];
    
    if (!cleanData.items || cleanData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
  } else {
    if (!selectedTransactions || selectedTransactions.length === 0) {
      alert('Please select at least one transaction');
      return;
    }
    

    cleanData.items = [{
      description: "Transaction-based invoice",
      quantity: 1,
      unit_price: 0.01,
      amount: 0.01
    }];
    cleanData.transaction_ids = selectedTransactions;
  }
  
  console.log('Submitting data:', JSON.stringify(cleanData, null, 2));
  
  try {
    await addInvoice(cleanData as CreateInvoiceDTO);
    onClose();
    
    setFormData({
      client_name: '',
      client_email: '',
      client_address: '',
      payment_terms: 'NET_30',
      currency: 'IDR',
      tax_rate: 10.00,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      items: [],
      transaction_ids: []
    });
    setUseInventoryForItem([]);
    setSelectedTransactions([]);
    setActiveTab('manual');
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.data.detail) {
        const errorDetail = Array.isArray(error.response.data.detail) 
          ? error.response.data.detail[0].msg 
          : error.response.data.detail;
          
        alert(`Failed to create invoice: ${errorDetail}`);
      } else {
        alert('Failed to create invoice. Check console for details.');
      }
    } else {
      alert('Failed to create invoice');
    }
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Invoice</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'manual'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => switchTab('manual')}
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Manual Entry
            </div>
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => switchTab('transactions')}
          >
            <div className="flex items-center">
              <FileCheck className="w-4 h-4 mr-2" />
              From Transactions
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input
                type="text"
                value={formData.client_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Email</label>
              <input
                type="email"
                value={formData.client_email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Client Address</label>
              <textarea
                value={formData.client_address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value as any }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="NET_7">7 days</option>
                <option value="NET_15">15 days</option>
                <option value="NET_30">30 days</option>
                <option value="NET_60">60 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as any }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.tax_rate}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tax_rate: parseFloat(e.target.value),
                tax_amount: (prev.subtotal || 0) * (parseFloat(e.target.value) / 100),
                total: (prev.subtotal || 0) * (1 + parseFloat(e.target.value) / 100)
              }))}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.01"
              min="0"
              max="100"
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'manual' ? (
            /* Manual Invoice Items Entry */
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
              <div className="space-y-4">
                {formData.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-6">
                      <input
                        type="checkbox"
                        checked={useInventoryForItem[index] || false}
                        onChange={(e) => {
                          const newValues = [...useInventoryForItem];
                          newValues[index] = e.target.checked;
                          setUseInventoryForItem(newValues);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      {useInventoryForItem[index] ? (
                        <select
                          value={item.inventory_item_id || ''}
                          onChange={(e) => handleInventoryItemSelect(index, Number(e.target.value))}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select inventory item</option>
                          {inventoryItems.map(invItem => (
                            <option key={invItem.id} value={invItem.id}>
                              {invItem.name} - Rp {invItem.price.toLocaleString()} (In stock: {invItem.quantity})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      )}
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        placeholder="Qty"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        min="1"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                        placeholder="Unit Price"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        step="0.01"
                        min="0"
                        disabled={useInventoryForItem[index]} 
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={item.amount}
                        className="w-full rounded-md border-gray-300 bg-gray-50"
                        readOnly
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {(!formData.items || formData.items.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    No items added yet. Click "Add Item" to start.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Transaction Selection */
            <div>
              <h3 className="text-lg font-medium mb-2">Select Transactions</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoadingTransactions ? (
                  <div className="p-4 text-center">Loading transactions...</div>
                ) : (
                  <>
                    {incomeTransactions.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-10 px-2 py-3"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {incomeTransactions.map((transaction) => (
                            <tr 
                              key={transaction.id} 
                              className={`hover:bg-gray-50 cursor-pointer ${
                                selectedTransactions.includes(transaction.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleTransaction(transaction.id)}
                            >
                              <td className="px-2 py-4 whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  checked={selectedTransactions.includes(transaction.id)}
                                  onChange={() => toggleTransaction(transaction.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.description || `Transaction #${transaction.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(transaction.transaction_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                Rp {transaction.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No income transactions found. Please create some transactions first.
                      </div>
                    )}
                  </>
                )}
              </div>
              {selectedTransactions.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* Totals */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <span className="text-gray-700">Subtotal:</span>
                <span className="ml-2 w-32 text-right">
                  {formData.currency} {Number(formData.subtotal || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-end">
                <span className="text-gray-700">Tax ({formData.tax_rate}%):</span>
                <span className="ml-2 w-32 text-right">
                  {formData.currency} {Number(formData.tax_amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-end text-lg font-bold">
                <span>Total:</span>
                <span className="ml-2 w-32 text-right">
                  {formData.currency} {Number(formData.total || 0).toLocaleString()}
                </span>
              </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (activeTab === 'manual' && (!formData.items || !formData.items.length)) || (activeTab === 'transactions' && (!selectedTransactions || !selectedTransactions.length))}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}