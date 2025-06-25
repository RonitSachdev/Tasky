'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  CheckCircle, 
  Plus, 
  Calendar, 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Flag,
  MoreHorizontal,
  X,
  GripVertical
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

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  task_counts: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
  };
  tasks: Task[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  overdue: boolean;
  due_soon: boolean;
  creator: User | null;
  assignee: User | null;
  created_at: string;
  updated_at: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  assignee_id: string;
}

interface StatusColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

// Sortable Task Card Component
function SortableTaskCard({ task, onEdit, onDelete, onTaskClick }: { 
  task: Task; 
  onEdit: (task: Task) => void; 
  onDelete: (taskId: number) => void; 
  onTaskClick: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card helvetica-ui ${isDragging ? 'dragging opacity-50' : ''} cursor-pointer`}
      onClick={() => onTaskClick(task)}
    >
      {/* Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      <div className="flex justify-between items-start mb-3 pr-6">
        <h4 className="helvetica-ui-medium text-gray-900 text-sm leading-tight flex-1">
          {task.title}
        </h4>
        <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="helvetica-ui text-gray-600 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-md text-xs helvetica-ui-medium border ${getPriorityColor(task.priority)}`}>
            <Flag className="w-2 h-2 inline mr-1" />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.due_date && (
            <span className={`text-xs helvetica-ui ${
              task.overdue ? 'text-red-600' : 
              task.due_soon ? 'text-amber-600' : 
              'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(task.due_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          )}
        </div>
        
        {task.assignee && (
          <div className="flex items-center text-xs text-gray-500 helvetica-ui">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-1">
              <span className="text-blue-600 text-xs helvetica-ui-medium">
                {task.assignee.full_name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Status Column Component
function StatusColumn({ column, onAddTask, onEditTask, onDeleteTask, onTaskClick }: { 
  column: StatusColumn; 
  onAddTask: (status: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onTaskClick: (task: Task) => void;
}) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({ id: column.id });

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: column.color }}
          />
          <h3 className="helvetica-ui-medium text-gray-900 text-sm">
            {column.title}
          </h3>
          <span className="helvetica-ui text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div
        ref={setNodeRef}
        className={`status-column ${isOver ? 'drag-over' : ''} group`}
      >
        <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <div key={task.id} className="group">
              <SortableTaskCard
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onTaskClick={onTaskClick}
              />
            </div>
          ))}
        </SortableContext>
        
        {column.tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="helvetica-ui text-sm">No tasks</div>
            <button
              onClick={() => onAddTask(column.id)}
              className="mt-2 helvetica-ui text-xs text-blue-600 hover:text-blue-700"
            >
              Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState('pending');
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    assignee_id: ''
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columns, setColumns] = useState<StatusColumn[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      organizeTasksIntoColumns(project.tasks);
    }
  }, [project]);

  const organizeTasksIntoColumns = (tasks: Task[]) => {
    const statusColumns: StatusColumn[] = [
      {
        id: 'pending',
        title: 'To Do',
        tasks: tasks.filter(task => task.status === 'pending'),
        color: '#6B7280'
      },
      {
        id: 'in_progress',
        title: 'In Progress',
        tasks: tasks.filter(task => task.status === 'in_progress'),
        color: '#3B82F6'
      },
      {
        id: 'completed',
        title: 'Completed',
        tasks: tasks.filter(task => task.status === 'completed'),
        color: '#10B981'
      },
      {
        id: 'cancelled',
        title: 'Cancelled',
        tasks: tasks.filter(task => task.status === 'cancelled'),
        color: '#EF4444'
      }
    ];
    
    setColumns(statusColumns);
  };

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [projectResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/projects/${projectId}`, config),
        axios.get(`${API_BASE_URL}/projects/assignable_users`, config)
      ]);

      setProject(projectResponse.data.project);
      setAssignableUsers(usersResponse.data.users || []);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`${API_BASE_URL}/tasks/${taskId}`, {
        task: { status: newStatus }
      }, config);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTaskId = Number(active.id);
    const overId = over.id as string;
    
    // Find the task being dragged
    const task = columns.flatMap(col => col.tasks).find(t => t.id === activeTaskId);
    if (!task) return;
    
    // Determine the new status
    let newStatus = overId;
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(overId)) {
      // If dropped on another task, find which column it's in
      const targetTask = columns.flatMap(col => col.tasks).find(t => t.id === Number(overId));
      if (targetTask) {
        newStatus = targetTask.status;
      } else {
        return;
      }
    }
    
    if (task.status !== newStatus) {
      // Update task status locally
      const updatedTask = { ...task, status: newStatus };
      const updatedTasks = project!.tasks.map(t => 
        t.id === activeTaskId ? updatedTask : t
      );
      
      setProject(prev => prev ? { ...prev, tasks: updatedTasks } : null);
      
      // Update in database
      updateTaskStatus(activeTaskId, newStatus);
    }
    
    setActiveId(null);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const taskData = {
        ...taskForm,
        assignee_id: taskForm.assignee_id || null,
        due_date: taskForm.due_date || null
      };

      if (editingTask) {
        await axios.put(`${API_BASE_URL}/tasks/${editingTask.id}`, {
          task: taskData
        }, config);
      } else {
        await axios.post(`${API_BASE_URL}/projects/${projectId}/tasks`, {
          task: taskData
        }, config);
      }

      resetTaskForm();
      fetchProjectData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, config);
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assignee_id: task.assignee?.id?.toString() || ''
    });
    setShowTaskForm(true);
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: newTaskStatus,
      priority: 'medium',
      due_date: '',
      assignee_id: ''
    });
    setEditingTask(null);
    setShowTaskForm(false);
    setNewTaskStatus('pending');
  };

  const handleAddTask = (status: string) => {
    setNewTaskStatus(status);
    setTaskForm(prev => ({ ...prev, status }));
    setShowTaskForm(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskDetailEdit = () => {
    if (selectedTask) {
      handleEditTask(selectedTask);
      setShowTaskDetail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center helvetica-ui">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 helvetica-ui">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center helvetica-ui">
        <div className="text-center">
          <h2 className="text-xl helvetica-ui-medium text-gray-900 mb-4">Project not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 helvetica-ui">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activeTask = activeId ? columns.flatMap(col => col.tasks).find(task => task.id === Number(activeId)) : null;

  return (
    <div className="min-h-screen bg-white helvetica-ui">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <div>
                <h1 className="text-xl helvetica-ui-bold text-gray-900">{project.name}</h1>
                <p className="text-sm helvetica-ui text-gray-500">{project.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleAddTask('pending')}
              className="helvetica-button helvetica-button-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
                     <div className="flex space-x-6 overflow-x-auto pb-6">
             <SortableContext items={columns.map(col => col.id)} strategy={verticalListSortingStrategy}>
               {columns.map((column) => (
                 <StatusColumn
                   key={column.id}
                   column={column}
                   onAddTask={handleAddTask}
                   onEditTask={handleEditTask}
                   onDeleteTask={handleDeleteTask}
                   onTaskClick={handleTaskClick}
                 />
               ))}
             </SortableContext>
           </div>
          
          <DragOverlay>
            {activeTask ? (
              <div className="task-card opacity-95 rotate-2">
                <h4 className="helvetica-ui-medium text-gray-900 text-sm">
                  {activeTask.title}
                </h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto helvetica-ui">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg helvetica-ui-medium text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={resetTaskForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="assignee_id" className="block text-sm helvetica-ui-medium text-gray-700 mb-2">
                  Assign to
                </label>
                <select
                  id="assignee_id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent helvetica-ui"
                  value={taskForm.assignee_id}
                  onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {assignableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="helvetica-button helvetica-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="helvetica-button helvetica-button-primary"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto helvetica-ui">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="text-xl helvetica-ui-bold text-gray-900 mb-2">
                  {selectedTask.title}
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-2 py-1 rounded-md text-xs helvetica-ui-medium border ${
                    selectedTask.status === 'completed' ? 'text-green-600 bg-green-50 border-green-200' :
                    selectedTask.status === 'in_progress' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                    selectedTask.status === 'pending' ? 'text-gray-600 bg-gray-50 border-gray-200' :
                    'text-red-600 bg-red-50 border-red-200'
                  }`}>
                    {selectedTask.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs helvetica-ui-medium border ${
                    selectedTask.priority === 'urgent' ? 'text-red-600 bg-red-50 border-red-200' :
                    selectedTask.priority === 'high' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                    selectedTask.priority === 'medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                    'text-green-600 bg-green-50 border-green-200'
                  }`}>
                    <Flag className="w-2 h-2 inline mr-1" />
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTaskDetail(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTask.description && (
              <div className="mb-6">
                <h4 className="text-sm helvetica-ui-medium text-gray-700 mb-2">Description</h4>
                <p className="helvetica-ui text-gray-600 text-sm leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {selectedTask.due_date && (
                <div>
                  <h4 className="text-sm helvetica-ui-medium text-gray-700 mb-2">Due Date</h4>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={`helvetica-ui text-sm ${
                      selectedTask.overdue ? 'text-red-600' : 
                      selectedTask.due_soon ? 'text-amber-600' : 
                      'text-gray-600'
                    }`}>
                      {new Date(selectedTask.due_date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              )}

              {selectedTask.assignee && (
                <div>
                  <h4 className="text-sm helvetica-ui-medium text-gray-700 mb-2">Assignee</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs helvetica-ui-medium">
                        {selectedTask.assignee.full_name.charAt(0)}
                      </span>
                    </div>
                    <span className="helvetica-ui text-sm text-gray-600">
                      {selectedTask.assignee.full_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h4 className="text-sm helvetica-ui-medium text-gray-700 mb-2">Created</h4>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="helvetica-ui text-sm text-gray-600">
                  {selectedTask.creator ? `By ${selectedTask.creator.full_name}` : 'Unknown'} on{' '}
                  {new Date(selectedTask.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTaskDetail(false)}
                className="helvetica-button helvetica-button-secondary"
              >
                Close
              </button>
              <button
                onClick={handleTaskDetailEdit}
                className="helvetica-button helvetica-button-primary flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 