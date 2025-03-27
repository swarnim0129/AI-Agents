import React, { useState } from 'react';
import axios from 'axios';

interface TrainingResults {
  model_performance: {
    random_forest: {
      accuracy: string;
      mse: string;
    };
    linear_regression: {
      r2_score: string;
      mse: string;
    };
  };
  feature_importance: Record<string, string>;
  training_metrics: {
    training_time: string;
    epochs: string;
    batch_size: string;
    learning_rate: string;
  };
}

const MLAgent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<TrainingResults | null>(null);
  const [featureValues, setFeatureValues] = useState<Record<string, number>>({});
  const [predictions, setPredictions] = useState<Record<string, number>>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('/upload', formData);
    }
  };

  const handleTrainModel = async () => {
    const response = await axios.post('/train', { target_column: 'your_target' });
    setResults(response.data);
  };

  const handleFeatureValueChange = (feature: string, value: string) => {
    setFeatureValues(prev => ({
      ...prev,
      [feature]: parseFloat(value)
    }));
  };

  const handleMakePrediction = async () => {
    const response = await axios.post('/predict', featureValues);
    setPredictions(response.data);
  };

  return (
    <div className="ml-agent">
      <h1>Machine Learning Agent</h1>
      
      {/* File Upload Section */}
      <section className="upload-section">
        <h2>Upload Data</h2>
        <input type="file" onChange={handleFileUpload} accept=".csv" />
      </section>

      {/* Model Selection & Training */}
      <section className="model-section">
        <h2>Select Model</h2>
        <select>
          <option value="random_forest">Random Forest Regressor</option>
          <option value="linear_regression">Linear Regression</option>
        </select>
        <button onClick={handleTrainModel}>Train Model</button>
      </section>

      {/* Results Display */}
      {results && (
        <section className="results-section">
          <h2>Training Results</h2>
          <div className="metrics-grid">
            <div className="performance-metrics">
              <h3>Model Performance</h3>
              {/* Display metrics */}
            </div>
            <div className="training-metrics">
              <h3>Training Metrics</h3>
              {/* Display training metrics */}
            </div>
            <div className="feature-importance">
              <h3>Feature Importance</h3>
              {/* Display feature importance */}
            </div>
          </div>
        </section>
      )}

      {/* Prediction Section */}
      <section className="prediction-section">
        <h2>Make New Predictions</h2>
        <div className="feature-inputs">
          {Object.keys(featureValues).map(feature => (
            <div key={feature} className="feature-input">
              <label>{feature}</label>
              <input
                type="number"
                value={featureValues[feature]}
                onChange={(e) => handleFeatureValueChange(feature, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button onClick={handleMakePrediction}>Make Predictions</button>
        
        {Object.keys(predictions).length > 0 && (
          <div className="predictions-results">
            <h3>Predictions</h3>
            {/* Display predictions */}
          </div>
        )}
      </section>
    </div>
  );
};

export default MLAgent; 