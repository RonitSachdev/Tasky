class Project < ApplicationRecord
  belongs_to :user
  belongs_to :organization
  has_many :tasks, dependent: :destroy

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :description, presence: true, length: { maximum: 1000 }

  scope :recent, -> { order(created_at: :desc) }

  def task_counts
    {
      total: tasks.count,
      completed: tasks.where(status: 'completed').count,
      in_progress: tasks.where(status: 'in_progress').count,
      pending: tasks.where(status: 'pending').count,
      cancelled: tasks.where(status: 'cancelled').count
    }
  end

  def completion_percentage
    return 0 if tasks.count == 0
    (tasks.where(status: 'completed').count.to_f / tasks.count * 100).round(1)
  end

  def assignable_users
    organization.all_members
  end
end
