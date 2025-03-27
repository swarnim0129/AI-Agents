import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                AI Agent Dashboard
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/#about" className="text-gray-700 hover:text-blue-600">About Us</Link>
              <Link to="/#features" className="text-gray-700 hover:text-blue-600">Features</Link>
              <button className="text-gray-700 hover:text-blue-600">Sign In</button>
              <button className="text-gray-700 hover:text-blue-600">Register</button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/#about" className="block px-3 py-2 text-gray-700 hover:text-blue-600">About Us</Link>
              <Link to="/#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Features</Link>
              <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">Sign In</button>
              <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600">Register</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-900 h-screen">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="AI Background"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            AI-Powered Analytics Dashboard
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Transform your data into actionable insights with our advanced AI agents. 
            From exploratory data analysis to machine learning predictions, we've got you covered.
          </p>
          <div className="mt-10">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-transform duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            About Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600">
                We're dedicated to making advanced AI and data analytics accessible to everyone.
                Our platform combines powerful tools with an intuitive interface to help you
                make data-driven decisions with confidence.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
              <p className="text-gray-600">
                We envision a future where data-driven insights are seamlessly integrated
                into every business decision. Our AI agents are designed to make this vision
                a reality, one dataset at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">EDA Agent</h3>
              <p className="text-gray-600">
                Automatically analyze and clean your data with our intelligent
                Exploratory Data Analysis agent.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">ML Agent</h3>
              <p className="text-gray-600">
                Train and evaluate multiple machine learning models with just
                a few clicks.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Visualizer</h3>
              <p className="text-gray-600">
                Create stunning visualizations and interactive charts to better
                understand your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 