'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Calendar, Users, BarChart3 } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const features = [
    {
      icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
      title: "Task Management",
      description: "Create, organize, and track tasks with ease. Set priorities and due dates."
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-600" />,
      title: "Project Planning",
      description: "Organize tasks into projects and track progress over time."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Team Collaboration",
      description: "Assign tasks to team members and collaborate effectively."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Progress Tracking",
      description: "Monitor project progress with visual indicators and reports."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Tasky</h1>
            </div>
            <nav className="flex space-x-4">
              {isAuthenticated ? (
                <Link 
                  href="/dashboard" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-600 hover:text-gray-900 px-4 py-2"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Manage Your Tasks
            <span className="block text-blue-600">Like a Pro</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Tasky is a powerful task management platform that helps you organize, prioritize, 
            and track your work efficiently. Stay productive and never miss a deadline.
          </p>
          <div className="mt-10">
            {!isAuthenticated && (
              <Link 
                href="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Tasky. Built with Rails & Next.js.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
