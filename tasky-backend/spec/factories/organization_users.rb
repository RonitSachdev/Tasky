FactoryBot.define do
  factory :organization_user do
    user { nil }
    organization { nil }
    role { "MyString" }
  end
end
