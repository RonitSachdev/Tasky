class User < ApplicationRecord
  has_secure_password

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, presence: true
  validates :last_name, presence: true

  has_many :projects, dependent: :destroy
  has_many :created_tasks, class_name: 'Task', foreign_key: 'user_id', dependent: :destroy
  has_many :assigned_tasks, class_name: 'Task', foreign_key: 'assignee_id', dependent: :nullify
  
  # Organization relationships
  has_many :organization_users, dependent: :destroy
  has_many :organizations, through: :organization_users
  
  has_one_attached :profile_picture

  def full_name
    "#{first_name} #{last_name}"
  end

  def to_jwt_payload
    {
      id: id,
      email: email,
      full_name: full_name
    }
  end

  # Organization role helpers
  def role_in_organization(organization)
    organization_users.find_by(organization: organization)&.role
  end

  def admin_in_organization?(organization)
    role_in_organization(organization) == 'admin'
  end

  def employee_in_organization?(organization)
    role_in_organization(organization) == 'employee'
  end

  def trainee_in_organization?(organization)
    role_in_organization(organization) == 'trainee'
  end

  def primary_organization
    organizations.first
  end

  def organization_colleagues(organization = nil)
    org = organization || primary_organization
    return User.none unless org
    
    org.users.where.not(id: id)
  end
end
