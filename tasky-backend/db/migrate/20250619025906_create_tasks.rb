class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.integer :status, default: 0
      t.integer :priority, default: 0
      t.datetime :due_date
      t.datetime :completed_at
      t.references :project, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true, index: { name: 'index_tasks_on_creator_id' }
      t.references :assignee, null: true, foreign_key: { to_table: :users }, index: true

      t.timestamps
    end

    add_index :tasks, :status
    add_index :tasks, :priority
    add_index :tasks, :due_date
  end
end
