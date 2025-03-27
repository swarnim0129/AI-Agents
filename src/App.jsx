import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import EDA from './components/dashboard/EDA';
import MLAgent from './components/dashboard/MLAgent';
import Visualizer from './components/dashboard/Visualizer';
import Insights from './components/dashboard/Insights';
import ChatBot from './components/ChatBot';

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<EDA />} />
          <Route path="ml-agent" element={<MLAgent />} />
          <Route path="visualizer" element={<Visualizer />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
      
      {/* Show ChatBot on all pages except landing page */}
      {!isLandingPage && <ChatBot />}
    </>
  );
}

export default App; 