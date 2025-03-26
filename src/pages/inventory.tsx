import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, BarChart2 } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import { InventoryItemModal } from '../components/InventoryItemModal';
import { InventoryAnalytics } from '../components/InventoryAnalytics';
import { InventoryItem } from '../types/inventory';

export function Inventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { items, isLoading, fetchItems } = useInventoryStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = () => {
    fetchItems(searchQuery);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center"
          >
            <BarChart2 className="w-5 h-5 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Search
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    Rp {item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span className={item.quantity < 10 ? 'text-red-600' : 'text-gray-900'}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                        onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true); 
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                          useInventoryStore.getState().deleteItem(item.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <InventoryItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        item={editingItem} 
      />
      
      <InventoryAnalytics
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  );
}