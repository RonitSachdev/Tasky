FactoryBot.define do
  factory :task do
    title { "MyString" }
    description { "MyText" }
    status { 1 }
    priority { 1 }
    due_date { "2025-06-19 11:59:06" }
    completed_at { "2025-06-19 11:59:06" }
    project { nil }
    user { nil }
    assignee { nil }
  end
end
