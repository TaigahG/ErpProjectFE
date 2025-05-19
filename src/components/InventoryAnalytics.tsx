import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  ComposableMap, 
  Geographies, 
  Geography,
  ZoomableGroup
} from "react-simple-maps";

interface InventoryAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}
interface RegionData {
  region: string;
  quantity_sold: number;
  revenue: number;
  transaction_count?: number;
}

export function InventoryAnalytics({ isOpen, onClose }: InventoryAnalyticsProps) {
  const { analytics, fetchAnalytics, isLoading } = useInventoryStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const[chartType, setChartType] = useState<'bar'| 'map'>('bar');
  

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, fetchAnalytics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Inventory Analytics</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'all-items'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all-items')}
          >
            All Items by Sales
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'regions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('regions')}
          >
            Regional Analysis
          </button>
        </div>
        
        {isLoading ? (
          <div className="p-4 text-center">Loading analytics...</div>
        ) : analytics ? (
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-3">Top Selling Items</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.top_selling_items}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        <Bar dataKey="total_sold" fill="#10B981" name="Units Sold" />
                        <Bar dataKey="total_revenue" fill="#3B82F6" name="Revenue (Rp)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Items to Restock</h3>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Monthly Sales</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Coverage</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.all_items_analysis.length > 0 ? (
                          analytics.all_items_analysis
                            .sort((a: { restock_recommendation: string }, b: { restock_recommendation: string }) => {
                              const priorityMap: { [key: string]: number } = { High: 0, Medium: 1, Low: 2 };
                              return priorityMap[a.restock_recommendation] - priorityMap[b.restock_recommendation];
                            })
                            .map((item: { 
                              id: number; 
                              name: string; 
                              current_stock: number; 
                              predicted_monthly_sales: number; 
                              restock_recommendation: string 
                            }) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                  <span className={item.current_stock < 10 ? 'text-red-600 font-bold' : 'text-gray-900'}>
                                    {item.current_stock}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                  {item.predicted_monthly_sales.toFixed(1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                  {item.predicted_monthly_sales > 0 
                                    ? `${(item.current_stock / item.predicted_monthly_sales).toFixed(1)} months` 
                                    : '∞'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                    ${item.restock_recommendation === 'High' ? 'bg-red-100 text-red-800' : 
                                      item.restock_recommendation === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800'}`}>
                                    {item.restock_recommendation}
                                  </span>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              No inventory items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Fastest Growing Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics.growth_items.map((item: { id: string; name: string; growth_rate: number; predicted_monthly_sales: number; turnover_rate: number; prediction_confidence: number }) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-gray-500">Growth Rate</span>
                            <p className="text-green-600 font-medium">{item.growth_rate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Predicted Sales</span>
                            <p>{item.predicted_monthly_sales.toFixed(1)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Turnover Rate</span>
                            <p>{item.turnover_rate.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Confidence</span>
                            <p>{(item.prediction_confidence * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'all-items' && (
              <div>
                <h3 className="text-lg font-medium mb-3">All Items Ranked by Sales</h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Top Region</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.all_items_analysis.length > 0 ? (
                        [...analytics.all_items_analysis]
                          .sort((a, b) => b.total_revenue - a.total_revenue)
                          .map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                {item.total_sold.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                Rp {item.total_revenue.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <span className={item.current_stock < 10 ? 'text-red-600 font-bold' : 'text-gray-900'}>
                                  {item.current_stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {item.regional_sales && item.regional_sales.length > 0 
                                  ? item.regional_sales[0].region 
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <button 
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setActiveTab('item-detail');
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No sales data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Regions Tab */}
            {activeTab === 'regions' && (
              <div>
                <h3 className="text-lg font-medium mb-3">Regional Sales Analysis</h3>

                <div className='flex justify-end mb-4'>
                  <div className='inline-flex rounded-md shadow-sm' role='group'>
                    <button
                      type='button'
                      onClick={() => setChartType('bar')}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                        chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                      }`}>
                        Bar Chart
                    </button>
                    <button
                      type='button'
                      onClick={() => setChartType('map')}
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                        chartType === 'map' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                      }`}>
                        Map Chart
                    </button>
                  </div>
                </div>
                
                
                {analytics.top_regions && analytics.top_regions.length > 0 ? (
                  <>
                    <div className="h-64 mb-6">
                      {chartType === 'bar' ? (

                      <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.top_regions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        <Bar dataKey="quantity_sold" fill="#10B981" name="Units Sold" />
                        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (Rp)" />
                      </BarChart>
                      </ResponsiveContainer>
                        
                      ) : (
                        
                        <ComposableMap
                          projection="geoMercator"
                          projectionConfig={{
                            scale: 1500,
                            center: [120, -5] 
                          }}
                        >
                          <ZoomableGroup>
                            <Geographies geography="../../indonesia-topo.json">
                              {({ geographies }) =>
                                geographies.map(geo => {
                                  
                                  const regionData = analytics.top_regions.find((r: RegionData) => r.region === geo.properties.NAME_2 || r.region === geo.properties.NAME_1);
                                  
                                  
                                  const getColorForValue = (value: number, regions: RegionData[]) => {
                                    const maxValue = Math.max(...regions.map(r => r.revenue));
                                    const normalized = value / maxValue;
                                    
                                    if (normalized < 0.25) return '#dbeafe'; 
                                    if (normalized < 0.5) return '#93c5fd';  
                                    if (normalized < 0.75) return '#3b82f6'; 
                                    return '#1d4ed8'; 
                                  };
                                  const fillColor = regionData
                                    ? getColorForValue(regionData.revenue, analytics.top_regions)
                                    : "#F5F4F6"; 
                                    
                                  return (
                                    <Geography
                                      key={geo.rsmKey}
                                      geography={geo}
                                      fill={fillColor}
                                      stroke="#FFFFFF"
                                      strokeWidth={0.5}
                                      onClick={() => {
                                        console.log("Clicked region:", geo.properties.NAME_2);
                                      }}
                                      onMouseEnter={() => {
                                        console.log("Mouse enter region:", geo.properties.NAME_2);
                                      }}
                                      style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#F53", outline: "none" },
                                        pressed: { outline: "none" }
                                      }}
                                    />
                                  );
                                })
                              }
                            </Geographies>
                          </ZoomableGroup>
                        </ComposableMap>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.top_regions.map((region: RegionData, index: number) => {
                            const totalRevenue = analytics.top_regions.reduce((sum: number, r: RegionData) => sum + r.revenue, 0);
                            const percentageOfTotal = totalRevenue > 0 ? (region.revenue / totalRevenue) * 100 : 0;
                            
                            return (
                              <tr key={region.region} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{region.region}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {region.quantity_sold.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  Rp {region.revenue.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {region.transaction_count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {percentageOfTotal.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No regional sales data available. Add transactions with region information to see this analysis.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'item-detail' && selectedItem && (
              <div>
                <div className="flex items-center mb-6">
                  <button 
                    onClick={() => setActiveTab('all-items')} 
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    ← Back to all items
                  </button>
                  <h3 className="text-lg font-medium">{selectedItem.name} - Detailed Analysis</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-3">Sales Overview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Units Sold:</span>
                        <span className="font-medium">{selectedItem.total_sold.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-medium">Rp {selectedItem.total_revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className={`font-medium ${selectedItem.current_stock < 10 ? 'text-red-600' : ''}`}>
                          {selectedItem.current_stock}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Predicted Monthly Sales:</span>
                        <span className="font-medium">{selectedItem.predicted_monthly_sales.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock Coverage:</span>
                        <span className="font-medium">
                          {selectedItem.predicted_monthly_sales > 0 
                            ? `${(selectedItem.current_stock / selectedItem.predicted_monthly_sales).toFixed(1)} months` 
                            : '∞'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Restock Recommendation:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${selectedItem.restock_recommendation === 'High' ? 'bg-red-100 text-red-800' : 
                            selectedItem.restock_recommendation === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {selectedItem.restock_recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-3">Growth Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Growth Rate:</span>
                        <span className="font-medium text-green-600">{selectedItem.growth_rate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turnover Rate:</span>
                        <span className="font-medium">{selectedItem.turnover_rate?.toFixed(2) || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue Impact:</span>
                        <span className="font-medium">Rp {selectedItem.revenue_impact?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prediction Confidence:</span>
                        <span className="font-medium">{(selectedItem.prediction_confidence * 100).toFixed(0) || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Regional Sales Distribution</h4>
                  
                  {selectedItem.regional_sales && selectedItem.regional_sales.length > 0 ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Item Sales</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {selectedItem.regional_sales.map((region: RegionData, index: number) => {
                            const percentageOfItemSales = selectedItem.total_revenue > 0 
                              ? (region.revenue / selectedItem.total_revenue) * 100 
                              : 0;
                            
                            return (
                              <tr key={region.region} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{region.region}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {region.quantity_sold.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  Rp {region.revenue.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                  {percentageOfItemSales.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
                      No regional sales data available for this item
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No analytics data available
          </div>
        )}
      </div>
    </div>
  );
}