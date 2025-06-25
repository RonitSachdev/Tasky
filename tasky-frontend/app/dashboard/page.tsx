'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  CheckCircle, 
  Plus, 
  FolderOpen, 
  Calendar, 
  BarChart3,
  LogOut,
  Settings,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api/v1';

interface User {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role?: string;
  organization?: {
    id: number;
    name: string;
    role: string;
  };
}

interface OrgMember {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  task_counts: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
    cancelled: number;
  };
  completion_percentage: number;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  created_at: string;
  assignee: {
    id: number;
    full_name: string;
  } | null;
  project: {
    id: number;
    name: string;
  };
}

interface SearchUser {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

interface ProjectFormData {
  name: string;
  description: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showOrgMembers, setShowOrgMembers] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('employee');
  const [isSearching, setIsSearching] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = userResponse.data.user;
      setUser(userData);
      
      // If user has no organization, redirect to onboarding
      if (!userData.organization) {
        router.push('/onboarding');
        return;
      }

      // Fetch projects and tasks
      const [projectsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProjects(projectsResponse.data.projects);
      
      // Extract recent tasks from projects
      const allTasks: Task[] = [];
      projectsResponse.data.projects.forEach((project: any) => {
        if (project.tasks) {
          project.tasks.forEach((task: any) => {
            allTasks.push({
              ...task,
              project: { id: project.id, name: project.name }
            });
          });
        }
      });
      
      // Sort by creation date and take the 5 most recent
      const recent = allTasks
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 5);
      
      setRecentTasks(recent);
    } catch (error) {
      console.error('Auth/data fetch failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsersForInvite = async (query: string) => {
    if (query.length < 3) {
      setSearchUsers([]);
      return;
    }

    setIsSearching(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`${API_BASE_URL}/organizations/search_users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query }
      });
      
      setSearchUsers(response.data.users);
    } catch (error) {
      console.error('User search failed:', error);
      setSearchUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addUserToOrganization = async (userEmail: string) => {
    const token = localStorage.getItem('token');
    if (!user?.organization) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/organizations/${user.organization.id}/add_user`,
        {
          email: userEmail,
          role: selectedRole
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('User added to organization successfully!');
      setError('');
      setSearchQuery('');
      setSearchUsers([]);
      
      // Refresh organization members
      fetchOrgMembers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Add user failed:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to add user to organization');
      } else {
        setError('Failed to add user to organization');
      }
      setSuccess('');
    }
  };

  const removeUserFromOrganization = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!user?.organization) return;

    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/organizations/${user.organization.id}/remove_user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('User removed from organization successfully!');
      setError('');
      
      // Refresh organization members
      fetchOrgMembers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Remove user failed:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to remove user from organization');
      } else {
        setError('Failed to remove user from organization');
      }
      setSuccess('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(`${API_BASE_URL}/projects`, {
        project: projectForm
      }, config);

      setProjectForm({ name: '', description: '' });
      setShowProjectForm(false);
      checkAuthAndFetchData();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const fetchOrgMembers = async (showModal = false) => {
    if (!user?.organization) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/organizations/${user.organization.id}/users`, config);
      setOrgMembers(response.data.users || []);
      if (showModal) {
        setShowOrgMembers(true);
      }
    } catch (error) {
      console.error('Error fetching organization members:', error);
    }
  };

  const getTotalTasks = () => projects.reduce((total, project) => total + project.task_counts.total, 0);
  const getCompletedTasks = () => projects.reduce((total, project) => total + project.task_counts.completed, 0);
  const getInProgressTasks = () => projects.reduce((total, project) => total + project.task_counts.in_progress, 0);
  const getPendingTasks = () => projects.reduce((total, project) => total + project.task_counts.pending, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center helvetica-ui">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 helvetica-ui">Loading dashboard...</p>
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
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <div className="helvetica-ui-medium text-gray-900">{user?.full_name}</div>
                  {user?.organization && (
                    <div className="text-xs text-gray-500">
                      {user.organization.role.charAt(0).toUpperCase() + user.organization.role.slice(1)} at {user.organization.name}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl helvetica-ui-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h2>
          <p className="helvetica-ui text-gray-600">
            Here's an overview of your projects and tasks.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl helvetica-ui-bold text-gray-900">
                  {projects.length}
                </div>
                <div className="text-sm helvetica-ui text-gray-500">Projects</div>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl helvetica-ui-bold text-gray-900">
                  {getTotalTasks()}
                </div>
                <div className="text-sm helvetica-ui text-gray-500">Total Tasks</div>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl helvetica-ui-bold text-green-600">
                  {getCompletedTasks()}
                </div>
                <div className="text-sm helvetica-ui text-gray-500">Completed</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl helvetica-ui-bold text-blue-600">
                  {getInProgressTasks()}
                </div>
                <div className="text-sm helvetica-ui text-gray-500">In Progress</div>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Team Section */}
        {user?.organization && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg helvetica-ui-bold text-gray-900">Your Team</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchOrgMembers(true)}
                  className="helvetica-button helvetica-button-secondary text-sm"
                >
                  View All Members
                </button>
                {user.organization.role === 'admin' && (
                  <button
                    onClick={() => {
                      fetchOrgMembers();
                      setShowUserManagement(true);
                    }}
                    className="helvetica-button helvetica-button-primary text-sm flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Manage Users</span>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 helvetica-ui-bold">
                    {user.organization.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="helvetica-ui-medium text-gray-900">{user.organization.name}</h4>
                  <p className="text-sm helvetica-ui text-gray-500">
                    You are a {user.organization.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg helvetica-ui-bold text-gray-900">Your Projects</h3>
          <button
            onClick={() => setShowProjectForm(true)}
            className="helvetica-button helvetica-button-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg helvetica-ui-medium text-gray-900 mb-2">No projects yet</h4>
            <p className="helvetica-ui text-gray-600 mb-6">Create your first project to get started with task management.</p>
            <button
              onClick={() => setShowProjectForm(true)}
              className="helvetica-button helvetica-button-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg helvetica-ui-bold text-gray-900 flex-1">
                    {project.name}
                  </h4>
                  <FolderOpen className="w-5 h-5 text-blue-600 ml-2" />
                </div>
                
                {project.description && (
                  <p className="helvetica-ui text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg helvetica-ui-bold text-gray-900">
                      {project.task_counts.total}
                    </div>
                    <div className="text-xs helvetica-ui text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg helvetica-ui-bold text-green-600">
                      {project.task_counts.completed}
                    </div>
                    <div className="text-xs helvetica-ui text-gray-500">Done</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm helvetica-ui text-gray-500">
                  <span>
                    Created {new Date(project.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  {project.task_counts.in_progress > 0 && (
                    <span className="text-blue-600 helvetica-ui-medium">
                      {project.task_counts.in_progress} active
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md helvetica-ui">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg helvetica-ui-medium text-gray-900">Create New Project</h3>
              <button
                onClick={() => setShowProjectForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="projectDescription" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="projectDescription"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
                  className="helvetica-button helvetica-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="helvetica-button helvetica-button-primary"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization Members Modal */}
      {showOrgMembers && user?.organization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto helvetica-ui">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg helvetica-ui-medium text-gray-900">
                {user.organization.name} Team Members
              </h3>
              <button
                onClick={() => setShowOrgMembers(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {orgMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm helvetica-ui-medium">
                        {member.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="helvetica-ui-medium text-gray-900">{member.full_name}</div>
                      <div className="text-sm helvetica-ui text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-md text-xs helvetica-ui-medium ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      member.role === 'employee' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowOrgMembers(false)}
                className="helvetica-button helvetica-button-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserManagement && user?.organization && user.organization.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto helvetica-ui">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg helvetica-ui-medium text-gray-900">
                Manage Organization Users
              </h3>
              <button
                onClick={() => setShowUserManagement(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm helvetica-ui text-green-800">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm helvetica-ui text-red-800">{error}</p>
              </div>
            )}

            {/* Add User Section */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="helvetica-ui-medium text-blue-900 mb-4">Add New User</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="user-search" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                    Search by email or name
                  </label>
                  <input
                    id="user-search"
                    type="text"
                    placeholder="Type to search for users..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsersForInvite(e.target.value);
                    }}
                  />
                </div>
                
                <div>
                  <label htmlFor="role-select" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    id="role-select"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                    <option value="trainee">Trainee</option>
                  </select>
                </div>
              </div>

              {/* Search Results */}
              {searchQuery.length >= 3 && (
                <div className="mt-4">
                  {isSearching ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm helvetica-ui text-gray-600">Searching...</p>
                    </div>
                  ) : searchUsers.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm helvetica-ui-medium text-gray-700">Available users:</p>
                      {searchUsers.map((searchUser) => (
                        <div key={searchUser.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-sm helvetica-ui-medium">
                                {searchUser.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="helvetica-ui-medium text-gray-900">{searchUser.full_name}</div>
                              <div className="text-sm helvetica-ui text-gray-500">{searchUser.email}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => addUserToOrganization(searchUser.email)}
                            className="helvetica-button helvetica-button-primary text-sm"
                          >
                            Add as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm helvetica-ui text-gray-600">No available users found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Current Members Section */}
            <div>
              <h4 className="helvetica-ui-medium text-gray-900 mb-4">Current Members</h4>
              <div className="space-y-3">
                {orgMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm helvetica-ui-medium">
                          {member.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="helvetica-ui-medium text-gray-900">{member.full_name}</div>
                        <div className="text-sm helvetica-ui text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-md text-xs helvetica-ui-medium ${
                        member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'employee' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'}
                      </span>
                      {member.id !== user.id && (
                        <button
                          onClick={() => removeUserFromOrganization(member.id)}
                          className="text-red-600 hover:text-red-800 text-sm helvetica-ui-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowUserManagement(false)}
                className="helvetica-button helvetica-button-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 