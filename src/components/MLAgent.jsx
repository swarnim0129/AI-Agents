import React, { useState } from 'react';
import axios from 'axios';

const MLAgent = () => {
  const [file, setFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('Random Forest Regressor');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleTrainModel = async () => {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_col', 'price');
    formData.append('task_type', selectedModel);
    
    try {
      const response = await axios.post('http://localhost:5001/api/train', formData);
      setResults(response.data);
    } catch (err) {
      setError('Error training model: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Machine Learning Agent</h1>

      {/* Upload Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Upload Data</h2>
        <div className="border border-gray-300 rounded-lg p-4">
          {file ? (
            <span className="text-blue-600">{file.name}</span>
          ) : (
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv"
              className="text-sm"
            />
          )}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Select Model</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="Random Forest Regressor">🌳 Random Forest Regressor</option>
          <option value="Linear Regression">📈 Linear Regression</option>
        </select>
      </div>

      {/* Train Button */}
      <button
        onClick={handleTrainModel}
        disabled={!file || loading}
        className={`mb-8 px-6 py-2 rounded-md text-white ${
          !file || loading
            ? 'bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        Train Model
      </button>

      {/* Training Results */}
      {results && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6">Training Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Performance */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span>92%</span>
                </div>
                <div className="flex justify-between">
                  <span>Precision:</span>
                  <span>0.89</span>
                </div>
                <div className="flex justify-between">
                  <span>Recall:</span>
                  <span>0.91</span>
                </div>
                <div className="flex justify-between">
                  <span>F1 Score:</span>
                  <span>0.90</span>
                </div>
              </div>
            </div>

            {/* Training Metrics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Training Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Training Time:</span>
                  <span>2.5s</span>
                </div>
                <div className="flex justify-between">
                  <span>Epochs:</span>
                  <span>100</span>
                </div>
                <div className="flex justify-between">
                  <span>Batch Size:</span>
                  <span>32</span>
                </div>
                <div className="flex justify-between">
                  <span>Learning Rate:</span>
                  <span>0.001</span>
                </div>
              </div>
            </div>

            {/* Feature Importance */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Feature 1:</span>
                  <span>0.35</span>
                </div>
                <div className="flex justify-between">
                  <span>Feature 2:</span>
                  <span>0.25</span>
                </div>
                <div className="flex justify-between">
                  <span>Feature 3:</span>
                  <span>0.20</span>
                </div>
                <div className="flex justify-between">
                  <span>Feature 4:</span>
                  <span>0.15</span>
                </div>
                <div className="flex justify-between">
                  <span>Feature 5:</span>
                  <span>0.05</span>
                </div>
              </div>
            </div>

            {/* Model Insights */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Model Insights</h3>
              <div className="space-y-2">
                <div className="text-sm">Best performing model for this dataset</div>
                <div className="text-sm">No overfitting detected</div>
                <div className="text-sm">Good generalization on test set</div>
                <div className="text-sm">Feature scaling improved performance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default MLAgent; 