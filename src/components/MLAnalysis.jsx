import React, { useState } from 'react';
import axios from 'axios';
import './MLAnalysis.css';

const MLAnalysis = ({ file }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('regression');

  const handleTrainModel = async () => {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_col', 'price'); // You might want to make this selectable
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
    <div className="ml-analysis">
      <h2>Machine Learning Analysis</h2>
      
      {/* Model Selection */}
      <div className="model-selection">
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          className="model-select"
        >
          <option value="regression">Linear Regression</option>
          <option value="classification">Random Forest Classifier</option>
        </select>
      </div>

      <button 
        onClick={handleTrainModel}
        disabled={loading || !file}
        className="train-button"
      >
        {loading ? 'Training...' : 'Train Model'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {results && (
        <div className="results-container">
          {/* Model Performance Section */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Model Performance</h3>
              {results.metrics.r2_score && (
                <div className="metric-item">
                  <span>R² Score:</span>
                  <span>{results.metrics.r2_score.toFixed(4)}</span>
                </div>
              )}
              {results.metrics.mse && (
                <div className="metric-item">
                  <span>Mean Squared Error:</span>
                  <span>{results.metrics.mse.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Plots Section */}
          <div className="plots-grid">
            {results.plots && Object.entries(results.plots).map(([name, base64Image]) => (
              <div key={name} className="plot-card">
                <h4>{name.split('_').join(' ').toUpperCase()}</h4>
                <img 
                  src={`data:image/png;base64,${base64Image}`} 
                  alt={name} 
                  className="plot-image"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MLAnalysis; 