# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create sample organizations
puts "Creating sample organizations..."

acme_corp = Organization.find_or_create_by(name: "Acme Corporation") do |org|
  org.description = "A leading technology company focused on innovative solutions"
end

startup_inc = Organization.find_or_create_by(name: "Startup Inc") do |org|
  org.description = "A fast-growing startup disrupting the market"
end

puts "Creating sample users..."

# Create sample users
demo_user = User.find_or_create_by(email: "demo@example.com") do |user|
  user.first_name = "Demo"
  user.last_name = "User"
  user.password = "password123"
  user.password_confirmation = "password123"
end

john_doe = User.find_or_create_by(email: "john@acme.com") do |user|
  user.first_name = "John"
  user.last_name = "Doe"
  user.password = "password123"
  user.password_confirmation = "password123"
end

jane_smith = User.find_or_create_by(email: "jane@acme.com") do |user|
  user.first_name = "Jane"
  user.last_name = "Smith"
  user.password = "password123"
  user.password_confirmation = "password123"
end

alice_johnson = User.find_or_create_by(email: "alice@startup.com") do |user|
  user.first_name = "Alice"
  user.last_name = "Johnson"
  user.password = "password123"
  user.password_confirmation = "password123"
end

bob_wilson = User.find_or_create_by(email: "bob@startup.com") do |user|
  user.first_name = "Bob"
  user.last_name = "Wilson"
  user.password = "password123"
  user.password_confirmation = "password123"
end

# Create users without organizations for testing
test_user1 = User.find_or_create_by(email: "test1@example.com") do |user|
  user.first_name = "Test"
  user.last_name = "User One"
  user.password = "password123"
  user.password_confirmation = "password123"
end

test_user2 = User.find_or_create_by(email: "test2@example.com") do |user|
  user.first_name = "Test"
  user.last_name = "User Two"
  user.password = "password123"
  user.password_confirmation = "password123"
end

new_user = User.find_or_create_by(email: "newuser@example.com") do |user|
  user.first_name = "New"
  user.last_name = "User"
  user.password = "password123"
  user.password_confirmation = "password123"
end

puts "Assigning users to organizations..."

# Assign users to organizations with roles
OrganizationUser.find_or_create_by(user: demo_user, organization: acme_corp) do |ou|
  ou.role = 'admin'
end

OrganizationUser.find_or_create_by(user: john_doe, organization: acme_corp) do |ou|
  ou.role = 'employee'
end

OrganizationUser.find_or_create_by(user: jane_smith, organization: acme_corp) do |ou|
  ou.role = 'employee'
end

OrganizationUser.find_or_create_by(user: alice_johnson, organization: startup_inc) do |ou|
  ou.role = 'admin'
end

OrganizationUser.find_or_create_by(user: bob_wilson, organization: startup_inc) do |ou|
  ou.role = 'trainee'
end

puts "Creating sample projects..."

# Update existing projects to belong to organizations
Project.where(organization_id: nil).find_each do |project|
  # Assign projects to the organization of their creator
  user_org = project.user.primary_organization
  if user_org
    project.update!(organization: user_org)
  else
    # If user has no organization, assign to acme_corp as default
    project.update!(organization: acme_corp)
  end
end

# Create additional sample projects if needed
if acme_corp.projects.count == 0
  project1 = acme_corp.projects.create!(
    name: "Website Redesign",
    description: "Complete overhaul of the company website with modern design and improved UX",
    user: demo_user
  )

  project2 = acme_corp.projects.create!(
    name: "Mobile App Development",
    description: "Develop a mobile application for iOS and Android platforms",
    user: john_doe
  )
end

if startup_inc.projects.count == 0
  project3 = startup_inc.projects.create!(
    name: "Product Launch",
    description: "Launch our new product with marketing campaign and user onboarding",
    user: alice_johnson
  )
end

puts "Creating sample tasks with assignees..."

# Create tasks with different assignees
acme_corp.projects.each do |project|
  next if project.tasks.any?

  # Get available assignees from the organization
  assignees = acme_corp.all_members.to_a

  [
    {
      title: "Design mockups",
      description: "Create initial design mockups for the project",
      status: "pending",
      priority: "high",
      due_date: 7.days.from_now,
      assignee: assignees.sample
    },
    {
      title: "Set up development environment",
      description: "Configure the development environment and tools",
      status: "in_progress",
      priority: "medium",
      due_date: 3.days.from_now,
      assignee: assignees.sample
    },
    {
      title: "Write project documentation",
      description: "Document the project requirements and specifications",
      status: "completed",
      priority: "low",
      due_date: 1.day.ago,
      assignee: assignees.sample
    }
  ].each do |task_data|
    project.tasks.create!(
      title: task_data[:title],
      description: task_data[:description],
      status: task_data[:status],
      priority: task_data[:priority],
      due_date: task_data[:due_date],
      user: project.user,
      assignee: task_data[:assignee]
    )
  end
end

startup_inc.projects.each do |project|
  next if project.tasks.any?

  # Get available assignees from the organization
  assignees = startup_inc.all_members.to_a

  [
    {
      title: "Market research",
      description: "Conduct comprehensive market research for the product launch",
      status: "pending",
      priority: "urgent",
      due_date: 5.days.from_now,
      assignee: assignees.sample
    },
    {
      title: "Create marketing materials",
      description: "Design and create marketing materials for the launch",
      status: "in_progress",
      priority: "high",
      due_date: 10.days.from_now,
      assignee: assignees.sample
    },
    {
      title: "Plan launch event",
      description: "Organize and plan the product launch event",
      status: "pending",
      priority: "medium",
      due_date: 14.days.from_now,
      assignee: assignees.sample
    }
  ].each do |task_data|
    project.tasks.create!(
      title: task_data[:title],
      description: task_data[:description],
      status: task_data[:status],
      priority: task_data[:priority],
      due_date: task_data[:due_date],
      user: project.user,
      assignee: task_data[:assignee]
    )
  end
end

puts "Seed data created successfully!"
puts "Organizations: #{Organization.count}"
puts "Users: #{User.count}"
puts "Users without organizations: #{User.left_joins(:organization_users).where(organization_users: { id: nil }).count}"
puts "Projects: #{Project.count}"
puts "Tasks: #{Task.count}"
puts ""
puts "Demo accounts:"
puts "- demo@example.com / password123 (Admin at Acme Corporation)"
puts "- john@acme.com / password123 (Employee at Acme Corporation)"
puts "- jane@acme.com / password123 (Employee at Acme Corporation)"
puts "- alice@startup.com / password123 (Admin at Startup Inc)"
puts "- bob@startup.com / password123 (Trainee at Startup Inc)"
