import { NavLink } from 'react-router-dom';
import { FaChartBar, FaRobot, FaChartPie, FaLightbulb } from 'react-icons/fa';

function Sidebar() {
  const menuItems = [
    { icon: FaChartBar, label: 'EDA', path: '/eda' },
    { icon: FaRobot, label: 'ML Agent', path: '/ml-agent' },
    { icon: FaChartPie, label: 'Visualizer', path: '/visualizer' },
    { icon: FaLightbulb, label: 'Insights', path: '/insights' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          AI Dashboard
        </h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-gray-700 transition-all duration-300 hover:bg-blue-50 ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <item.icon className="text-xl" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar; 