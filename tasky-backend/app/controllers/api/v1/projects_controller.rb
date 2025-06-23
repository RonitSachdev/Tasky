class Api::V1::ProjectsController < ApplicationController
  before_action :set_project, only: [:show, :update, :destroy]

  def index
    # Get projects from user's primary organization or all user's projects
    organization = current_user.primary_organization
    projects = if organization
                 organization.projects.includes(:user, :tasks)
               else
                 current_user.projects.includes(:tasks)
               end
    
    render json: {
      projects: projects.map { |project| project_response(project) }
    }
  end

  def show
    render json: {
      project: project_response(@project),
      assignable_users: assignable_users_response(@project)
    }
  end

  def create
    organization = current_user.primary_organization
    unless organization
      render_error('You must belong to an organization to create projects', :unprocessable_entity)
      return
    end

    project = organization.projects.build(project_params)
    project.user = current_user

    if project.save
      render json: {
        project: project_response(project),
        message: 'Project created successfully'
      }, status: :created
    else
      render_errors(project)
    end
  end

  def update
    if @project.update(project_params)
      render json: {
        project: project_response(@project),
        message: 'Project updated successfully'
      }
    else
      render_errors(@project)
    end
  end

  def destroy
    @project.destroy
    render json: { message: 'Project deleted successfully' }
  end

  def assignable_users
    organization = current_user.primary_organization
    unless organization
      render json: { users: [] }
      return
    end

    users = organization.all_members
    render json: {
      users: users.map { |user| assignable_user_response(user, organization) }
    }
  end

  private

  def set_project
    organization = current_user.primary_organization
    @project = if organization
                 organization.projects.find(params[:id])
               else
                 current_user.projects.find(params[:id])
               end
  rescue ActiveRecord::RecordNotFound
    render_error('Project not found', :not_found)
  end

  def project_params
    params.require(:project).permit(:name, :description)
  end

  def project_response(project)
    {
      id: project.id,
      name: project.name,
      description: project.description,
      user_id: project.user_id,
      organization_id: project.organization_id,
      task_counts: project.task_counts,
      completion_percentage: project.completion_percentage,
      created_at: project.created_at,
      updated_at: project.updated_at,
      tasks: project.tasks.map { |task| task_response(task) }
    }
  end

  def assignable_users_response(project)
    project.assignable_users.map { |user| assignable_user_response(user, project.organization) }
  end

  def assignable_user_response(user, organization)
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role_in_organization(organization)
    }
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
      creator: task.creator ? user_response(task.creator) : nil,
      assignee: task.assignee ? user_response(task.assignee) : nil,
      created_at: task.created_at,
      updated_at: task.updated_at
    }
  end

  def user_response(user)
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      first_name: user.first_name,
      last_name: user.last_name
    }
  end
end
