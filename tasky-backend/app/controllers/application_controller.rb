class ApplicationController < ActionController::API
  before_action :authenticate_request
  
  private

  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    
    begin
      decoded = JsonWebToken.decode(header)
      @current_user = User.find(decoded[:user_id])
    rescue ActiveRecord::RecordNotFound => e
      render json: { errors: 'Unauthorized' }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { errors: 'Invalid token' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end

  def authenticate_request!
    render json: { errors: 'Unauthorized' }, status: :unauthorized unless current_user
  end

  def skip_authentication
    @skip_authentication = true
  end

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_errors(object)
    render json: { errors: object.errors.full_messages }, status: :unprocessable_entity
  end
end
