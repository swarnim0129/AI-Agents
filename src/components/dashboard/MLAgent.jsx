import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ML_MODELS = [
  { value: 'linear_regression', label: '📊 Linear Regression' },
  { value: 'random_forest', label: '📊 Random Forest Regressor' },
  { value: 'decision_tree', label: '📊 Decision Tree Regressor' },
  { value: 'neural_network', label: '📊 Neural Network Regressor' },
  { value: 'svr', label: '📊 SVR' },
  { value: 'xgboost', label: '📊 XGBoost Regressor' },
  { value: 'lightgbm', label: '📊 LightGBM Regressor' },
  { value: 'gradient_boosting', label: '📊 Gradient Boosting Regressor' },
  { value: 'extra_trees', label: '📊 Extra Trees Regressor' },
  { value: 'adaboost', label: '📊 AdaBoost Regressor' }
];

function MLAgent() {
  const [file, setFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('linear_regression');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Read columns from the CSV file
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        // First read the file locally to get columns
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const lines = text.split('\n');
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim());
            setColumns(headers);
          }
        };
        reader.readAsText(selectedFile);
      } catch (err) {
        setError('Error reading file columns');
        console.error(err);
      }
    }
  };

  const handleTrainModel = async () => {
    if (!file) {
      setError('Please upload a file');
      return;
    }
    if (!selectedTarget) {
      setError('Please select a target column');
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_col', selectedTarget);
    formData.append('model_type', selectedModel);
    
    try {
      const response = await axios.post('http://localhost:5001/api/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResults(response.data);
      }
    } catch (err) {
      console.error('Training error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred during training');
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {file ? (
            <p className="text-blue-600">{file.name}</p>
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

      {/* Target Column Selection */}
      {columns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Target Column</h2>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a target column...</option>
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Model Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Select Model</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          {ML_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </div>

      {/* Train Button */}
      <button
        onClick={handleTrainModel}
        disabled={!file || !selectedTarget || loading}
        className={`mb-8 px-6 py-2 rounded-md text-white ${
          !file || !selectedTarget || loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Training...' : 'Train Model'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="mt-8">
          <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">Model Results Comparison</h2>

            {/* Model Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Model Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>R² Score:</span>
                    <span>{results.metrics?.r2_score?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mean Squared Error:</span>
                    <span>{results.metrics?.mse?.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Training Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Training Time:</span>
                    <span>{results.metrics?.training_time}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Iterations:</span>
                    <span>{results.metrics?.iterations}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* R² Score Visualization */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">R² Score Comparison</h3>
              <div className="h-80 bg-gray-800 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: selectedModel, value: results.metrics?.r2_score }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis domain={[0, 1]} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Bar dataKey="value" fill="#6366F1" name="R² Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MSE Visualization */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Mean Squared Error Comparison</h3>
              <div className="h-80 bg-gray-800 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: selectedModel, value: results.metrics?.mse }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Bar dataKey="value" fill="#6366F1" name="MSE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance */}
            {results.feature_importance && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Feature Importance</h3>
                <div className="h-80 bg-gray-800 p-4 rounded-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={Object.entries(results.feature_importance).map(([feature, value]) => ({
                        feature,
                        importance: value
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="feature" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Bar dataKey="importance" fill="#6366F1" name="Importance" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MLAgent;