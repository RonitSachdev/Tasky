'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, Plus, Users, AlertCircle, Building2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api/v1';

interface User {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  organization?: {
    id: number;
    name: string;
    role: string;
  };
}

export default function Onboarding() {
  const [user, setUser] = useState<User | null>(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndUser();
  }, []);

  const checkAuthAndUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      setUser(userData);
      
      // If user has an organization, redirect to dashboard
      if (userData.organization) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/organizations`,
        {
          organization: orgForm
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update user data and redirect to dashboard
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('user', JSON.stringify(userResponse.data.user));
      router.push('/dashboard');
    } catch (error) {
      console.error('Organization creation failed:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create organization. Please try again.');
      } else {
        setError('Failed to create organization. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center helvetica-ui">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white helvetica-ui">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CheckCircle className="w-7 h-7 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl helvetica-ui-bold text-gray-900">Tasky</h1>
                <p className="text-sm helvetica-ui text-gray-500">Project Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm helvetica-ui text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 helvetica-ui-medium">
                    {user.full_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="helvetica-ui-medium text-gray-900">{user.full_name}</div>
                  <div className="text-xs text-gray-500">Welcome to Tasky!</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl helvetica-ui-bold text-gray-900 mb-4">
            Welcome to Tasky, {user.first_name}!
          </h1>
          <p className="text-lg helvetica-ui text-gray-600 max-w-2xl mx-auto">
            To get started with project management, you'll need to be part of an organization. 
            You can either create a new organization or wait for an admin to add you to an existing one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Organization Option */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl helvetica-ui-bold text-gray-900 mb-2">
                Create New Organization
              </h3>
              <p className="helvetica-ui text-gray-600">
                Start fresh with your own organization and invite team members later.
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateOrg(true)}
              className="w-full helvetica-button helvetica-button-primary"
            >
              Create Organization
            </button>
          </div>

          {/* Wait for Invitation Option */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl helvetica-ui-bold text-gray-900 mb-2">
                Join Existing Organization
              </h3>
              <p className="helvetica-ui text-gray-600">
                Ask your organization admin to add you using your email address:
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm helvetica-ui-medium text-gray-700 text-center">
                {user.email}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm helvetica-ui text-gray-500 mb-4">
                Once added, you'll automatically gain access to your organization's projects and tasks.
              </p>
              <button
                onClick={checkAuthAndUser}
                className="helvetica-button helvetica-button-secondary"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="helvetica-ui-medium text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm helvetica-ui text-blue-800 space-y-1">
                <li>• If you create an organization, you'll become the admin and can invite others</li>
                <li>• If you join an existing organization, you'll have access to shared projects</li>
                <li>• Organization admins can assign you to projects and tasks</li>
                <li>• You can collaborate with team members in real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Create Organization Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md helvetica-ui">
            <h3 className="text-lg helvetica-ui-medium text-gray-900 mb-4">
              Create New Organization
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm helvetica-ui text-red-800">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label htmlFor="org-name" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  id="org-name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  placeholder="Enter organization name"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="org-description" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="org-description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui resize-none"
                  placeholder="Describe your organization"
                  value={orgForm.description}
                  onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateOrg(false)}
                  className="helvetica-button helvetica-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="helvetica-button helvetica-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 