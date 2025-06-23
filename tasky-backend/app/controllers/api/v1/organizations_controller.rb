class Api::V1::OrganizationsController < ApplicationController
  before_action :set_organization, only: [:show, :update, :destroy, :users, :add_user, :remove_user]
  before_action :ensure_admin_access, only: [:create, :update, :destroy, :add_user, :remove_user]

  def index
    organizations = current_user.organizations
    render json: {
      organizations: organizations.map { |org| organization_response(org) }
    }
  end

  def show
    render json: {
      organization: organization_response(@organization)
    }
  end

  def create
    organization = Organization.new(organization_params)
    
    if organization.save
      # Make the creator an admin of the organization
      organization.organization_users.create!(
        user: current_user,
        role: 'admin'
      )
      
      render json: {
        organization: organization_response(organization),
        message: 'Organization created successfully'
      }, status: :created
    else
      render_errors(organization)
    end
  end

  def update
    if @organization.update(organization_params)
      render json: {
        organization: organization_response(@organization),
        message: 'Organization updated successfully'
      }
    else
      render_errors(@organization)
    end
  end

  def destroy
    @organization.destroy
    render json: { message: 'Organization deleted successfully' }
  end

  def users
    users = @organization.all_members.includes(:organization_users)
    render json: {
      users: users.map { |user| user_with_role_response(user, @organization) }
    }
  end

  def add_user
    user = User.find_by(email: params[:email])
    
    unless user
      render_error('User not found', :not_found)
      return
    end

    if user.organizations.include?(@organization)
      render_error('User is already a member of this organization', :unprocessable_entity)
      return
    end

    if user.organizations.any?
      render_error('User is already a member of another organization', :unprocessable_entity)
      return
    end

    role = params[:role].presence || 'employee'
    unless %w[admin employee trainee].include?(role)
      render_error('Invalid role. Must be admin, employee, or trainee', :unprocessable_entity)
      return
    end

    organization_user = @organization.organization_users.build(
      user: user,
      role: role
    )

    if organization_user.save
      render json: {
        user: user_with_role_response(user, @organization),
        message: 'User added to organization successfully'
      }, status: :created
    else
      render_errors(organization_user)
    end
  end

  def remove_user
    user = User.find(params[:user_id])
    organization_user = @organization.organization_users.find_by(user: user)

    unless organization_user
      render_error('User is not a member of this organization', :not_found)
      return
    end

    # Prevent removing the last admin
    if organization_user.role == 'admin' && @organization.organization_users.where(role: 'admin').count == 1
      render_error('Cannot remove the last admin from the organization', :unprocessable_entity)
      return
    end

    organization_user.destroy
    render json: { message: 'User removed from organization successfully' }
  end

  def search_users
    query = params[:query].to_s.strip
    
    if query.length < 3
      render json: { users: [] }
      return
    end

    # Search for users who are not in any organization
    users = User.left_joins(:organization_users)
                .where(organization_users: { id: nil })
                .where('email ILIKE ? OR CONCAT(first_name, \' \', last_name) ILIKE ?', 
                       "%#{query}%", "%#{query}%")
                .limit(10)

    render json: {
      users: users.map { |user| basic_user_response(user) }
    }
  end

  private

  def set_organization
    @organization = current_user.organizations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error('Organization not found', :not_found)
  end

  def ensure_admin_access
    return if params[:action] == 'create' # Anyone can create an organization
    
    unless current_user.admin_in_organization?(@organization)
      render_error('Access denied. Admin privileges required.', :forbidden)
    end
  end

  def organization_params
    params.require(:organization).permit(:name, :description)
  end

  def organization_response(organization)
    {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      user_count: organization.users.count,
      project_count: organization.projects.count,
      user_role: current_user.role_in_organization(organization),
      created_at: organization.created_at
    }
  end

  def user_with_role_response(user, organization)
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role_in_organization(organization),
      created_at: user.created_at
    }
  end

  def basic_user_response(user)
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      first_name: user.first_name,
      last_name: user.last_name
    }
  end
end
