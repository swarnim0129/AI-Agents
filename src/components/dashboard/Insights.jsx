import React from 'react';
import { FaChartBar, FaCogs, FaDatabase, FaChartLine, FaLightbulb } from 'react-icons/fa';

function Insights() {
  const workflowSteps = [
    {
      icon: <FaDatabase className="text-blue-500 text-2xl" />,
      title: "Data Upload & Processing",
      description: "The system accepts CSV files containing your dataset. It automatically processes and validates the data, ensuring it's ready for analysis.",
      efficiency: "Handles large datasets efficiently with automatic column type detection and validation."
    },
    {
      icon: <FaChartBar className="text-purple-500 text-2xl" />,
      title: "Exploratory Data Analysis (EDA)",
      description: "Generates comprehensive visualizations including histograms, correlation matrices, box plots, and scatter plots to help understand data patterns.",
      efficiency: "Interactive visualizations with hover effects for detailed insights."
    },
    {
      icon: <FaCogs className="text-green-500 text-2xl" />,
      title: "Model Training",
      description: "Supports multiple regression models for prediction tasks. Automatically handles data preprocessing, scaling, and validation.",
      efficiency: "Optimized training process with built-in cross-validation."
    },
    {
      icon: <FaChartLine className="text-red-500 text-2xl" />,
      title: "Performance Analysis",
      description: "Evaluates model performance using metrics like R² Score and Mean Squared Error. Provides visual comparisons of model predictions.",
      efficiency: "Real-time performance metrics and visualization updates."
    },
    {
      icon: <FaLightbulb className="text-yellow-500 text-2xl" />,
      title: "Results & Recommendations",
      description: "Presents comprehensive analysis results with interactive visualizations and detailed performance metrics.",
      efficiency: "Clear, actionable insights for decision-making."
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">System Workflow & Efficiency</h2>

      <div className="space-y-8">
        {workflowSteps.map((step, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              {step.icon}
              <h3 className="text-xl font-semibold ml-3">{step.title}</h3>
            </div>
            
            <div className="ml-9">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Process:</h4>
                <p className="text-gray-600">{step.description}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">Efficiency:</h4>
                <p className="text-gray-600">{step.efficiency}</p>
              </div>
            </div>

            {index < workflowSteps.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>
            )}
          </div>
        ))}

        {/* Additional System Benefits */}
        <div className="bg-blue-50 rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">System Benefits</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Automated data processing reduces manual effort and potential errors</li>
            <li>Interactive visualizations enable deeper data understanding</li>
            <li>Real-time performance metrics for immediate feedback</li>
            <li>Scalable architecture handles various dataset sizes</li>
            <li>User-friendly interface requires minimal technical expertise</li>
          </ul>
        </div>

        {/* Technical Specifications */}
        <div className="bg-gray-50 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Frontend:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>React.js for dynamic UI</li>
                <li>Tailwind CSS for styling</li>
                <li>Plotly.js for interactive visualizations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Backend:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Python Flask server</li>
                <li>Pandas for data processing</li>
                <li>Scikit-learn for modeling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights; 