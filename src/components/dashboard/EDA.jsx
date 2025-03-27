import { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const EDA = () => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [cleanData, setCleanData] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    try {
      const uploadedFile = event.target.files[0];
      if (!uploadedFile) {
        setError('No file selected');
        return;
      }

      setFile(uploadedFile);
      setShowTable(false);
      setError(null);
      setLoading(true);

      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: false
      });

      console.log('Upload response:', response.data);
      setColumns(response.data.columns);
      setStatistics(response.data.statistics);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Error uploading file');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnSelect = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedColumns(selectedOptions);
  };

  const handleProcessData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5001/api/process', {
        selectedColumns,
        cleanData,
        imputationStrategy: 'Mean',
        scalingMethod: 'Standard',
        encodingMethod: 'OneHot'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false,
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setTableData(response.data.data);
      setShowTable(true);
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.response?.data?.error || err.message || 'Error processing data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5001/api/download', {
        data: tableData
      }, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cleaned_data.csv');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      console.error('Download error:', err);
      setError('Error downloading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Exploratory Data Analysis</h1>
      
      {/* File Upload Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Upload Data</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800"
          >
            {file ? file.name : 'Click to upload CSV file'}
          </label>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="card bg-blue-50">
          <p className="text-blue-600">Processing...</p>
        </div>
      )}
      
      {error && (
        <div className="card bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Statistics Section */}
      {statistics && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Data Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>Rows: {statistics.rows}</p>
              <p>Columns: {statistics.columns}</p>
            </div>
            <div>
              <h3 className="font-semibold">Missing Values:</h3>
              <ul className="text-sm">
                {Object.entries(statistics.missing_values).map(([col, count]) => (
                  count > 0 && (
                    <li key={col}>{col}: {count}</li>
                  )
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Column Selection Section */}
      {file && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Select Columns</h2>
          <select
            multiple
            value={selectedColumns}
            onChange={handleColumnSelect}
            className="input-field h-32"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Data Cleaning Option */}
      {file && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Data Cleaning</h2>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={cleanData}
              onChange={(e) => setCleanData(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Clean Data (remove missing values, handle outliers)</span>
          </label>
        </div>
      )}

      {/* Process Button */}
      {file && selectedColumns.length > 0 && (
        <button
          onClick={handleProcessData}
          disabled={loading}
          className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Process Data
        </button>
      )}

      {/* Data Table */}
      {showTable && tableData.length > 0 && (
        <div className="card overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Processed Data</h2>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download CSV</span>
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(tableData[0]).map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  {Object.values(row).map((value, valueIdx) => (
                    <td
                      key={valueIdx}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {typeof value === 'number' ? value.toFixed(4) : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EDA; 