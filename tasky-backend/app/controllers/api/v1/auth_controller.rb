class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:signup, :login]

  def signup
    user_data = user_params.dup
    if user_data[:full_name].present?
      name_parts = user_data[:full_name].strip.split(' ', 2)
      user_data[:first_name] = name_parts[0]
      user_data[:last_name] = name_parts[1] || name_parts[0]
      user_data.delete(:full_name)
    end
    
    user = User.new(user_data)
    
    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: user_response(user),
        message: 'Account created successfully'
      }, status: :created
    else
      render_errors(user)
    end
  end

  def login
    login_params = params[:user] || params
    user = User.find_by(email: login_params[:email])
    
    if user&.authenticate(login_params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: user_response(user),
        message: 'Logged in successfully'
      }
    else
      render_error('Invalid email or password', :unauthorized)
    end
  end

  def logout
    render json: { message: 'Logged out successfully' }
  end

  def me
    render json: { user: user_response(current_user) }
  end

  private

  def user_params
    if params[:user]
      params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name, :full_name)
    else
      params.permit(:email, :password, :password_confirmation, :first_name, :last_name, :full_name)
    end
  end

  def user_response(user)
    primary_org = user.primary_organization
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      created_at: user.created_at,
      organization: primary_org ? {
        id: primary_org.id,
        name: primary_org.name,
        role: user.role_in_organization(primary_org)
      } : nil
    }
  end
end
