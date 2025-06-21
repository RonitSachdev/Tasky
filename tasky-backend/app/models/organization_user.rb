class OrganizationUser < ApplicationRecord
  belongs_to :user
  belongs_to :organization

  validates :role, presence: true, inclusion: { in: %w[admin employee trainee] }
  validates :user_id, uniqueness: { scope: :organization_id }

  scope :admins, -> { where(role: 'admin') }
  scope :employees, -> { where(role: 'employee') }
  scope :trainees, -> { where(role: 'trainee') }
end
