// src/components/ReportExporter.tsx
import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

interface ReportExporterProps {
  reportType: 'balance-sheet' | 'profit-loss';
  parameters: any;
}

export function ReportExporter({ reportType, parameters }: ReportExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  
  const exportReport = async () => {
    setIsExporting(true);
    try {
      const endpoint = `/api/v1/reports/${reportType}/export`;
      const response = await axios.get(endpoint, {
        params: { ...parameters, format },
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className="border rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setFormat('pdf')}
          className={`px-3 py-1 ${format === 'pdf' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
        >
          <FileText className="w-4 h-4" />
          <span className="sr-only">PDF</span>
        </button>
        <button
          type="button"
          onClick={() => setFormat('excel')}
          className={`px-3 py-1 ${format === 'excel' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="sr-only">Excel</span>
        </button>
      </div>
      
      <button
        onClick={exportReport}
        disabled={isExporting}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        <Download className="w-5 h-5 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  );
}