require 'rails_helper'

RSpec.describe "Api::V1::Auths", type: :request do
  describe "GET /signup" do
    it "returns http success" do
      get "/api/v1/auth/signup"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /login" do
    it "returns http success" do
      get "/api/v1/auth/login"
      expect(response).to have_http_status(:success)
    end
  end

end
