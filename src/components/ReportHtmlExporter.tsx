import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import axios from 'axios';

interface ReportHtmlExporterProps {
  reportType: 'profit-loss-ifrs' | 'balance-sheet-ifrs';
  parameters: any;
}

export function ReportHtmlExporter({ reportType, parameters }: ReportHtmlExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  
  const exportReport = async () => {
    setIsExporting(true);
    try {
      const endpoint = `http://127.0.0.1:8000/api/v1/reports/export-html/${reportType}`;
      const response = await axios.get(endpoint, {
        params: parameters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewHtml(reader.result as string);
      };
      reader.readAsText(new Blob([response.data]));
      
      const link = document.createElement('a');
      link.href = url;
      const filename = reportType === 'profit-loss-ifrs' 
        ? `profit-loss-${parameters.start_date}-to-${parameters.end_date}.html`
        : `balance-sheet-${parameters.as_of_date}.html`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const closePreview = () => {
    setPreviewHtml(null);
  };
  
  return (
    <div>
      <button
        onClick={exportReport}
        disabled={isExporting}
        className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
      >
        <FileText className="w-5 h-5 mr-2" />
        {isExporting ? 'Generating...' : 'Generate IFRS Report'}
      </button>
      
      {previewHtml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Report Preview</h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto border p-4">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full"
                title="Report Preview"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([previewHtml], { type: 'text/html' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute(
                    'download',
                    reportType === 'profit-loss-ifrs'
                      ? `profit-loss-${parameters.start_date}-to-${parameters.end_date}.html`
                      : `balance-sheet-${parameters.as_of_date}.html`
                  );
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode?.removeChild(link);
                  window.URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}