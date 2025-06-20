Rails.application.routes.draw do
  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  # PWA routes
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes
      post '/auth/signup', to: 'auth#signup'
      post '/auth/login', to: 'auth#login'
      delete '/auth/logout', to: 'auth#logout'
      get '/auth/me', to: 'auth#me'

      # Organizations routes
      resources :organizations do
        member do
          get :users
          post :add_user
          delete 'remove_user/:user_id', to: 'organizations#remove_user', as: :remove_user
        end
        collection do
          get :search_users
        end
      end

      # Projects routes
      resources :projects do
        resources :tasks, except: [:index]
        collection do
          get :assignable_users
        end
      end

      # Tasks routes (for standalone task operations)
      resources :tasks, only: [:show, :update, :destroy]
      
      # Additional routes
      get "dashboard", to: "dashboard#index"
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "posts#index"
end
