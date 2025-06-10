import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useAccountCategoryStore } from '../store/accountCategoryStore';
import { CSVImportGuide } from './ImportGuide';
import Papa from 'papaparse';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CSVRow {
  id?: string;
  amount: string;
  transaction_type: string;
  description: string;
  category: string;
  transaction_date: string;
  notes?: string;
  region: string;
  account_category_id: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });
  const [step, setStep] = useState<'upload' | 'validate' | 'import' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { bulkImportTransactions, importFromCSV } = useTransactionStore();
  const { categories, fetchCategories } = useAccountCategoryStore();

  const indonesianRegions = [
    'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara',
    'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Palembang',
    'Bali', 'Yogyakarta', 'Tangerang', 'Bekasi', 'Depok',
    'Bogor', 'Malang', 'Padang', 'Pontianak', 'Banjarmasin',
    'Lampung', 'Aceh', 'Manado', 'Papua', 'Riau', 'Jambi'
  ];

  const transactionTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];

  React.useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        console.log('CSV Parse Results:', results);
        
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          alert('Error parsing CSV file. Please check the file format.');
          setIsUploading(false);
          return;
        }

        const data = results.data as CSVRow[];
        setCsvData(data);
        setStep('validate');
        setIsUploading(false);
        validateData(data);
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        alert('Error reading CSV file');
        setIsUploading(false);
      }
    });
  };

  const validateData = (data: CSVRow[]) => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      
      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push({
          row: rowNumber,
          field: 'amount',
          message: 'Amount must be a positive number',
          value: row.amount
        });
      }

      if (!transactionTypes.includes(row.transaction_type)) {
        errors.push({
          row: rowNumber,
          field: 'transaction_type',
          message: `Transaction type must be one of: ${transactionTypes.join(', ')}`,
          value: row.transaction_type
        });
      }

      if (!row.description?.trim()) {
        errors.push({
          row: rowNumber,
          field: 'description',
          message: 'Description is required',
          value: row.description
        });
      }

      if (!row.category?.trim()) {
        errors.push({
          row: rowNumber,
          field: 'category',
          message: 'Category is required',
          value: row.category
        });
      }

      const date = new Date(row.transaction_date);
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowNumber,
          field: 'transaction_date',
          message: 'Invalid date format. Use YYYY-MM-DD',
          value: row.transaction_date
        });
      }

      if (!indonesianRegions.includes(row.region)) {
        errors.push({
          row: rowNumber,
          field: 'region',
          message: `Region must be one of the valid Indonesian regions`,
          value: row.region
        });
      }

      const categoryId = parseInt(row.account_category_id);
      if (isNaN(categoryId)) {
        errors.push({
          row: rowNumber,
          field: 'account_category_id',
          message: 'Account category ID must be a valid number',
          value: row.account_category_id
        });
      } else {
        const categoryExists = categories.some(cat => cat.id === categoryId);
        if (!categoryExists) {
          errors.push({
            row: rowNumber,
            field: 'account_category_id',
            message: 'Account category ID does not exist in system',
            value: row.account_category_id
          });
        }
      }
    });

    setValidationErrors(errors);
  };

  const handleImport = async () => {
    setStep('import');
    setIsUploading(true);
    
    try {
      const validRows = csvData.filter((row, index) => {
        const rowNumber = index + 1;
        return !validationErrors.some(error => error.row === rowNumber);
      });

      const transactionData = validRows.map(row => ({
        amount: parseFloat(row.amount),
        transaction_type: row.transaction_type as any,
        description: row.description,
        category: row.category,
        transaction_date: row.transaction_date,
        notes: row.notes || '',
        region: row.region,
        account_category_id: parseInt(row.account_category_id)
      }));

      const result = await bulkImportTransactions(transactionData);
      
      setImportStats({ 
        success: result.success_count, 
        failed: result.failed_count 
      });
      
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
      }
      
      setIsUploading(false);
      setStep('complete');
      setImportSuccess(true);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStats({ success: 0, failed: csvData.length });
      setIsUploading(false);
      setStep('complete');
    }
  };

  const downloadTemplate = () => {
    const template = `id,amount,transaction_type,description,category,transaction_date,notes,region,account_category_id
    1,1000000,INCOME,Sales Revenue,Product Sales,2024-01-15,Monthly sales,Jakarta Pusat,54
    2,500000,EXPENSE,Office Rent,Rent Expense,2024-01-01,Monthly office rent,Jakarta Pusat,66
    3,2000000,ASSET,Cash and Cash Equivalents,Cash,2024-01-10,Initial cash deposit,Jakarta Pusat,27`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transaction_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplateCat = () => {
    const template = `id,name,code,type,parent_id
        25,Assets,1000,ASSET,
        26,Current Assets,1100,ASSET,25.0
        27,Cash and Cash Equivalents,1110,ASSET,26.0
        28,Accounts Receivable,1120,ASSET,26.0
        29,Inventory,1130,ASSET,26.0
        30,Prepaid Expenses,1140,ASSET,26.0
        31,Other Current Assets,1190,ASSET,26.0
        32,Non-Current Assets,1200,ASSET,25.0
        33,"Property, Plant and Equipment",1210,ASSET,32.0
        34,Intangible Assets,1220,ASSET,32.0
        35,Investments,1230,ASSET,32.0
        36,Other Non-Current Assets,1290,ASSET,32.0
        37,Liabilities,2000,LIABILITY,
        38,Current Liabilities,2100,LIABILITY,37.0
        39,Accounts Payable,2110,LIABILITY,38.0
        40,Short-term Loans,2120,LIABILITY,38.0
        41,Accrued Expenses,2130,LIABILITY,38.0
        42,Taxes Payable,2140,LIABILITY,38.0
        43,Other Current Liabilities,2190,LIABILITY,38.0
        44,Non-Current Liabilities,2200,LIABILITY,37.0
        45,Long-term Loans,2210,LIABILITY,44.0
        46,Deferred Tax Liabilities,2220,LIABILITY,44.0
        47,Other Non-Current Liabilities,2290,LIABILITY,44.0
        48,Equity,3000,EQUITY,
        49,Share Capital,3100,EQUITY,48.0
        50,Retained Earnings,3200,EQUITY,48.0
        51,Additional Paid-in Capital,3300,EQUITY,48.0
        52,Other Comprehensive Income,3400,EQUITY,48.0
        53,Revenue,4000,INCOME,
        54,Sales Revenue,4100,INCOME,53.0
        55,Service Revenue,4200,INCOME,53.0
        56,Interest Income,4300,INCOME,53.0
        57,Rental Income,4400,INCOME,53.0
        58,Other Revenue,4900,INCOME,53.0
        59,Expenses,5000,EXPENSE,
        60,Cost of Sales,5100,EXPENSE,59.0
        61,Direct Material Costs,5110,EXPENSE,60.0
        62,Direct Labor Costs,5120,EXPENSE,60.0
        63,Manufacturing Overhead,5130,EXPENSE,60.0
        64,Operating Expenses,5200,EXPENSE,59.0
        65,Salaries and Wages,5210,EXPENSE,64.0
        66,Rent Expense,5220,EXPENSE,64.0
        67,Utilities,5230,EXPENSE,64.0
        68,Office Supplies,5240,EXPENSE,64.0
        69,Marketing and Advertising,5250,EXPENSE,64.0
        70,Professional Fees,5260,EXPENSE,64.0
        71,Insurance,5270,EXPENSE,64.0
        72,Depreciation,5280,EXPENSE,64.0
        73,Amortization,5290,EXPENSE,64.0
        74,Financial Expenses,5300,EXPENSE,59.0
        75,Interest Expense,5310,EXPENSE,74.0
        76,Bank Charges,5320,EXPENSE,74.0
        77,Tax Expenses,5400,EXPENSE,59.0
        78,Other Expenses,5900,EXPENSE,59.0`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Kategori_Akutansi.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setCsvData([]);
    setValidationErrors([]);
    setStep('upload');
    setImportSuccess(false);
    setImportStats({ success: 0, failed: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Transactions from CSV</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-6">
          <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : step === 'validate' || step === 'import' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'upload' ? 'bg-blue-100' : step === 'validate' || step === 'import' || step === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>1</div>
            <span className="ml-2">Upload</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className={`flex items-center ${step === 'validate' ? 'text-blue-600' : step === 'import' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'validate' ? 'bg-blue-100' : step === 'import' || step === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>2</div>
            <span className="ml-2">Validate</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className={`flex items-center ${step === 'import' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'import' ? 'bg-blue-100' : step === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>3</div>
            <span className="ml-2">Import</span>
          </div>
        </div>

        
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">Upload CSV File</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Upload a CSV file containing your transaction data
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
              
              <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Processing...' : 'Choose File'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            <CSVImportGuide onDownloadTemplate={downloadTemplate} onDownloadCat={downloadTemplateCat} />
          </div>
        )}

        {/* Validation Step */}
        {step === 'validate' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Validation Results</h3>
              <div className="text-sm text-gray-500">
                {csvData.length} rows found
              </div>
            </div>

            {validationErrors.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">
                    {validationErrors.length} validation errors found
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      Row {error.row}, {error.field}: {error.message} (value: "{error.value}")
                    </div>
                  ))}
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Please fix these errors in your CSV file and upload again.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">
                    All rows are valid and ready for import
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to Upload
              </button>
              
              {validationErrors.length === 0 && (
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Start Import
                </button>
              )}
            </div>
          </div>
        )}

        {/* Import Step */}
        {step === 'import' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Importing Transactions</h3>
              <p className="text-sm text-gray-500">Please wait while we import your data...</p>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">Import Complete</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Import Summary:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">Successfully Imported:</span>
                  <div className="text-2xl font-bold text-green-600">{importStats.success}</div>
                </div>
                <div>
                  <span className="text-red-600 font-medium">Failed:</span>
                  <div className="text-2xl font-bold text-red-600">{importStats.failed}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}