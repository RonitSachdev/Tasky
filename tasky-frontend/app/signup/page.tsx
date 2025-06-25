'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export default function Signup() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
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
      console.error('Signup error:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Signup failed. Please try again.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex helvetica-ui">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-blue-50 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-8" />
          <h2 className="text-3xl helvetica-ui-bold text-gray-900 mb-6">
            Join thousands of teams
          </h2>
          <p className="helvetica-ui text-gray-600 text-lg leading-relaxed">
            Start managing your projects more effectively with our intuitive and powerful platform.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl helvetica-ui-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="helvetica-ui text-gray-600">
              Start your project management journey
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
              <label htmlFor="full_name" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

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
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="password_confirmation" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  placeholder="Confirm your password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                >
                  {showPasswordConfirmation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full helvetica-button helvetica-button-primary py-3 text-sm helvetica-ui-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm helvetica-ui text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="helvetica-ui-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 