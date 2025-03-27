# AI Agent Dashboard

A modern web application for data analysis and machine learning, built with React and Tailwind CSS.

## Features

- **EDA (Exploratory Data Analysis)**: Upload and analyze your data with interactive tools
- **ML Agent**: Train and evaluate various machine learning models
- **Visualizer**: Create beautiful data visualizations
- **Insights**: Get AI-powered insights and recommendations

## Tech Stack

- React.js
- Tailwind CSS
- React Router
- Heroicons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-agent-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   └── dashboard/
│       ├── EDA.jsx
│       ├── MLAgent.jsx
│       ├── Visualizer.jsx
│       └── Insights.jsx
├── pages/
│   ├── LandingPage.jsx
│   └── Dashboard.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Features in Detail

### Landing Page
- Modern hero section with background image
- Responsive navigation
- About Us and Features sections
- Call-to-action buttons

### Dashboard
- Collapsible sidebar navigation
- Responsive layout
- Four main sections:
  1. EDA (Exploratory Data Analysis)
  2. ML Agent
  3. Visualizer
  4. Insights

### EDA Section
- CSV file upload
- Column selection
- Data cleaning options
- Interactive data table

### ML Agent Section
- Multiple model selection
- Training results display
- Performance metrics
- Feature importance analysis

### Visualizer Section
- Multiple chart types
- Interactive controls
- Responsive grid layout
- 3D visualization support

### Insights Section
- Data quality insights
- Model performance analysis
- Feature analysis
- Recommendations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 