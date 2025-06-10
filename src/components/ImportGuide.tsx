import React from 'react';
import { Info, Download } from 'lucide-react';

interface CSVImportGuideProps {
  onDownloadCat: () => void;
  onDownloadTemplate: () => void;
}

export function CSVImportGuide({ onDownloadTemplate, onDownloadCat}: CSVImportGuideProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            CSV Import Instructions
          </h3>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="space-y-1 ml-4">
                <li><strong>amount:</strong> Transaction amount (positive number, e.g., 1000000)</li>
                <li><strong>transaction_type:</strong> Tipe Transaksi harus diantara ini: ASSET, LIABILITY, EQUITY, INCOME, EXPENSE</li>
                <li><strong>description:</strong> Transaction description (Wajib)</li>
                <li><strong>category:</strong> Transaction category (Wajib)</li>
                <li><strong>transaction_date:</strong> Date format YYYY-MM-DD (e.g., 2024-01-15)</li>
                <li><strong>region:</strong> Indonesian region (e.g., Jakarta Pusat, Bandung, Surabaya)</li>
                <li><strong>account_category_id:</strong> Kategori Akutansi ID harus sesuai dengan <strong>`ID`</strong> yang terdapat di <strong>`Template Kategori Akutansi`</strong></li>
                <li><strong>notes:</strong> Opsional notes tambahan</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Valid Indonesian Regions:</h4>
              <div className="text-xs bg-white p-2 rounded border">
                Jakarta Pusat, Jakarta Barat, Jakarta Selatan, Jakarta Timur, Jakarta Utara, 
                Bandung, Surabaya, Medan, Semarang, Makassar, Palembang, Bali, Yogyakarta, 
                Tangerang, Bekasi, Depok, Bogor, Malang, Padang, Pontianak, Banjarmasin, 
                Lampung, Aceh, Manado, Papua, Riau, Jambi
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Important Notes:</h4>
              <ul className="space-y-1 ml-4">
                <li>• Transaction Type harus sesuai dengan Account Category type</li>
                <li>• Account category ID harus sesuai dengan yang telah di tetapkan di template kategori akutansi</li>
                <li>• Dates harus dalam YYYY-MM-DD format</li>
                <li>• Amounts harus dalam angka positive tanpa simbol currency</li>
                <li>• Semua kolom yang harus diisi harus memiliki di isi</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={onDownloadTemplate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template CSV
              </button>
              <button
                onClick={onDownloadCat}
                className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template Kategori Akutansi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}