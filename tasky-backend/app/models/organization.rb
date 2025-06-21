class Organization < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :description, presence: true

  has_many :organization_users, dependent: :destroy
  has_many :users, through: :organization_users
  has_many :projects, dependent: :destroy

  # Scopes for different user roles
  def admins
    users.joins(:organization_users).where(organization_users: { role: 'admin' })
  end

  def employees
    users.joins(:organization_users).where(organization_users: { role: 'employee' })
  end

  def trainees
    users.joins(:organization_users).where(organization_users: { role: 'trainee' })
  end

  def all_members
    users.joins(:organization_users).order('organization_users.role ASC, users.first_name ASC')
  end
end
