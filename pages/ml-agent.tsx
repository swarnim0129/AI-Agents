import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MLAgent() {
  return (
    <div>
      <h1>Machine Learning Agent</h1>
      
      <section>
        <h2>Upload Data</h2>
      </section>

      <section>
        <h2>Select Model</h2>
      </section>

      <section>
        <h2>Training Results</h2>
      </section>

      <section className="bg-[#25262b] rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> Model Results Comparison
        </h2>

        <div className="grid gap-6">
          <div className="bg-[#2c2d32] p-4 rounded">
            <h3 className="mb-4">Linear Regression Results</h3>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>R² Score:</span>
                <span>0.5088</span>
              </div>
              <div className="flex justify-between">
                <span>Mean Squared Error:</span>
                <span>21.5512</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2c2d32] p-4 rounded">
              <h4 className="mb-4">R² Score Comparison</h4>
              <Bar
                data={{
                  labels: ['Linear Regression'],
                  datasets: [{
                    label: 'R² Score',
                    data: [0.5088],
                    backgroundColor: 'rgba(99, 102, 241, 0.8)'
                  }]
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 1
                    }
                  }
                }}
              />
            </div>
            <div className="bg-[#2c2d32] p-4 rounded">
              <h4 className="mb-4">Mean Squared Error Comparison</h4>
              <Bar
                data={{
                  labels: ['Linear Regression'],
                  datasets: [{
                    label: 'MSE',
                    data: [21.5512],
                    backgroundColor: 'rgba(239, 68, 68, 0.8)'
                  }]
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#25262b] rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🎯</span> Make New Predictions
        </h2>

        <div className="grid gap-6">
          {[
            { name: 'Humidity', value: 70.07 },
            { name: 'PM2.5', value: 20.14 },
            { name: 'PM10', value: 30.22 },
            { name: 'NO2', value: 26.41 },
            { name: 'SO2', value: 10.01 },
            { name: 'CO', value: 1.50 },
            { name: 'Proximity_to_Industrial_Areas', value: 8.43 },
            { name: 'Population_Density', value: 497.42 }
          ].map((feature) => (
            <div key={feature.name} className="grid gap-2">
              <label className="flex justify-between items-center">
                {feature.name}
                <button className="text-gray-400 hover:text-gray-300">ⓘ</button>
              </label>
              <div className="flex items-center gap-2">
                <button className="bg-[#373737] w-8 h-8 rounded flex items-center justify-center">
                  -
                </button>
                <input
                  type="number"
                  value={feature.value}
                  className="bg-[#1a1b1e] border border-[#373737] rounded px-3 py-2 w-full"
                />
                <button className="bg-[#373737] w-8 h-8 rounded flex items-center justify-center">
                  +
                </button>
              </div>
            </div>
          ))}

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Make Predictions
          </button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Prediction Results</h3>
            <div className="bg-[#2c2d32] rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 bg-[#1a1b1e]">Model</th>
                    <th className="text-left p-4 bg-[#1a1b1e]">Prediction</th>
                    <th className="text-left p-4 bg-[#1a1b1e]">Confidence/Probability</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4">Linear Regression</td>
                    <td className="p-4">30.0574</td>
                    <td className="p-4 text-blue-400">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 