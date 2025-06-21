class Task < ApplicationRecord
  belongs_to :project
  belongs_to :user # creator
  belongs_to :assignee, class_name: 'User', optional: true

  validates :title, presence: true, length: { minimum: 2, maximum: 200 }
  validates :description, length: { maximum: 2000 }

  enum :status, {
    pending: 0,
    in_progress: 1,
    completed: 2,
    cancelled: 3
  }

  enum :priority, {
    low: 0,
    medium: 1,
    high: 2,
    urgent: 3
  }

  scope :overdue, -> { where('due_date < ? AND status != ?', Time.current, statuses[:completed]) }
  scope :due_today, -> { where(due_date: Date.current.beginning_of_day..Date.current.end_of_day) }
  scope :recent, -> { order(created_at: :desc) }

  # Alias for creator (user who created the task)
  def creator
    user
  end

  def overdue?
    due_date && due_date < Time.current && !completed?
  end

  def due_soon?
    due_date && due_date < 3.days.from_now && due_date > Time.current
  end

  def complete!
    update!(status: :completed, completed_at: Time.current)
  end
end
