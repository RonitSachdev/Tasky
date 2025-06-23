class Api::V1::TasksController < ApplicationController
  before_action :set_project, only: [:index, :create]
  before_action :set_task, only: [:show, :update, :destroy]
  before_action :set_user_task, only: [:show, :update, :destroy]

  def index
    @tasks = @project.tasks.includes(:assignee, :user).recent
    render json: {
      tasks: @tasks.map { |task| task_response(task) }
    }
  end

  def show
    render json: {
      task: task_response(@task)
    }
  end

  def create
    @task = @project.tasks.build(task_params)
    @task.user = current_user
    
    if @task.save
      render json: {
        task: task_response(@task),
        message: 'Task created successfully'
      }, status: :created
    else
      render_errors(@task)
    end
  end

  def update
    if @task.update(task_params)
      render json: {
        task: task_response(@task),
        message: 'Task updated successfully'
      }
    else
      render_errors(@task)
    end
  end

  def destroy
    @task.destroy
    render json: { message: 'Task deleted successfully' }
  end

  private

  def set_project
    @project = current_user.projects.find(params[:project_id])
  rescue ActiveRecord::RecordNotFound
    render_error('Project not found', :not_found)
  end

  def set_task
    @task = Task.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error('Task not found', :not_found)
  end

  def set_user_task
    # Ensure user can only access tasks from their own projects
    unless @task.project.user == current_user
      render_error('Unauthorized', :unauthorized)
    end
  end

  def task_params
    params.require(:task).permit(:title, :description, :status, :priority, :due_date, :assignee_id)
  end

  def task_response(task)
    {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      completed_at: task.completed_at,
      overdue: task.overdue?,
      due_soon: task.due_soon?,
      project: {
        id: task.project.id,
        name: task.project.name
      },
      creator: task.user ? {
        id: task.user.id,
        full_name: task.user.full_name,
        email: task.user.email
      } : nil,
      assignee: task.assignee ? {
        id: task.assignee.id,
        full_name: task.assignee.full_name,
        email: task.assignee.email
      } : nil,
      created_at: task.created_at,
      updated_at: task.updated_at
    }
  end
end
