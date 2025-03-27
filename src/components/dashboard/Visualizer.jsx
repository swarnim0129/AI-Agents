import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function Visualizer() {
  const [file, setFile] = useState(null);
  const [visualizations, setVisualizations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setError(null);
    setVisualizations(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await axios.post('http://localhost:5001/api/visualize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else if (!response.data.visualizations) {
        setError('No visualizations were generated');
      } else {
        setVisualizations(response.data.visualizations);
      }
    } catch (err) {
      console.error('Visualization error:', err);
      setError(
        err.response?.data?.error || 
        'Error generating visualizations. Please try again with a different file.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Visualizer</h1>

      {/* Upload Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Upload Data for Visualization</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv"
            className="text-sm"
            disabled={loading}
          />
          {file && <p className="mt-2 text-sm text-gray-600">{file.name}</p>}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Generating visualizations...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Visualizations Display */}
      {visualizations && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(visualizations).map(([name, plotData]) => (
            <div key={name} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold capitalize">
                  {name.replace(/_/g, ' ')}
                </h3>
              </div>
              <div className="p-4">
                <Plot
                  data={plotData.data}
                  layout={{
                    ...plotData.layout,
                    autosize: true,
                    margin: { t: 30, r: 10, b: 30, l: 40 }
                  }}
                  config={{ responsive: true }}
                  className="w-full h-[400px]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Visualizer; 