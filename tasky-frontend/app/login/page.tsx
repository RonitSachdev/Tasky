'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        user: formData
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on organization status
      if (user.organization) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        user: {
          email: 'demo@example.com',
          password: 'password123'
        }
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on organization status
      if (user.organization) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex helvetica-ui">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl helvetica-ui-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="helvetica-ui text-gray-600">
              Sign in to your Tasky account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="helvetica-ui text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full helvetica-button helvetica-button-primary py-3 text-sm helvetica-ui-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white helvetica-ui text-gray-500">Or try demo account</span>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full mt-4 helvetica-button helvetica-button-secondary py-3 text-sm helvetica-ui-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Demo Login'}
            </button>
          </div>

          <p className="mt-8 text-center text-sm helvetica-ui text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="helvetica-ui-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-blue-50 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-8" />
          <h2 className="text-3xl helvetica-ui-bold text-gray-900 mb-6">
            Manage projects with ease
          </h2>
          <p className="helvetica-ui text-gray-600 text-lg leading-relaxed">
            Organize your tasks, track progress, and collaborate with your team in a clean, intuitive interface.
          </p>
        </div>
      </div>
    </div>
  );
} 