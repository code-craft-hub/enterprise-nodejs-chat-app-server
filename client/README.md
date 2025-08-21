src/
├── app/                          # App-level configuration and providers
│   ├── App.tsx                   # Main App component
│   ├── store/                    # Global state management
│   │   ├── index.ts              # Store configuration
│   │   ├── rootReducer.ts        # Root reducer (if using Redux)
│   │   └── slices/               # Redux slices or Zustand stores
│   │       ├── authSlice.ts
│   │       ├── userSlice.ts
│   │       └── index.ts
│   └── providers/                # Context providers
│       ├── AuthProvider.tsx
│       ├── ThemeProvider.tsx
│       └── index.tsx
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Basic UI components (buttons, inputs, etc.)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts              # Barrel exports
│   ├── layout/                   # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout/
│   └── common/                   # Common business components
│       ├── LoadingSpinner/
│       ├── ErrorBoundary/
│       ├── ProtectedRoute/
│       └── DataTable/
│
├── features/                     # Feature-based modules
│   ├── auth/                     # Authentication feature
│   │   ├── components/           # Feature-specific components
│   │   │   ├── LoginForm/
│   │   │   ├── SignupForm/
│   │   │   └── index.ts
│   │   ├── hooks/                # Feature-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── index.ts
│   │   ├── services/             # Feature-specific API calls
│   │   │   ├── authApi.ts
│   │   │   └── index.ts
│   │   ├── types/                # Feature-specific types
│   │   │   ├── auth.types.ts
│   │   │   └── index.ts
│   │   ├── utils/                # Feature-specific utilities
│   │   │   ├── authHelpers.ts
│   │   │   └── index.ts
│   │   └── index.ts              # Feature barrel export
│   ├── dashboard/
│   ├── users/
│   ├── products/
│   └── reports/
│
├── hooks/                        # Global custom hooks
│   ├── useApi.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   └── index.ts
│
├── services/                     # Global services and API layer
│   ├── api/                      # API configuration and clients
│   │   ├── client.ts             # Axios/Fetch client setup
│   │   ├── interceptors.ts       # Request/Response interceptors
│   │   ├── endpoints.ts          # API endpoints constants
│   │   └── index.ts
│   ├── storage/                  # Storage services
│   │   ├── localStorage.ts
│   │   ├── sessionStorage.ts
│   │   └── index.ts
│   └── analytics/                # Analytics services
│       ├── googleAnalytics.ts
│       └── index.ts
│
├── lib/                          # External library configurations
│   ├── axios.ts                  # Axios configuration
│   ├── queryClient.ts            # React Query configuration
│   ├── dayjs.ts                  # Date library configuration
│   └── index.ts
│
├── pages/                        # Page components (route components)
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.test.tsx
│   │   └── index.ts
│   ├── LoginPage/
│   ├── DashboardPage/
│   ├── UsersPage/
│   ├── NotFoundPage/
│   └── index.ts
│
├── router/                       # Routing configuration
│   ├── AppRouter.tsx             # Main router setup
│   ├── routes.tsx                # Route definitions
│   ├── ProtectedRoute.tsx        # Protected route wrapper
│   └── index.ts
│
├── styles/                       # Global styles and theme
│   ├── globals.css               # Global CSS styles
│   ├── variables.css             # CSS custom properties
│   ├── themes/                   # Theme configurations
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   └── index.ts
│   └── components/               # Component-specific styles
│       ├── button.css
│       └── modal.css
│
├── types/                        # Global TypeScript type definitions
│   ├── api.types.ts              # API response types
│   ├── common.types.ts           # Common shared types
│   ├── user.types.ts             # User-related types
│   ├── env.types.ts              # Environment variable types
│   └── index.ts
│
├── utils/                        # Global utility functions
│   ├── formatters/               # Data formatting utilities
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── index.ts
│   ├── validators/               # Validation utilities
│   │   ├── email.ts
│   │   ├── phone.ts
│   │   └── index.ts
│   ├── constants/                # Application constants
│   │   ├── routes.ts
│   │   ├── api.ts
│   │   ├── messages.ts
│   │   └── index.ts
│   ├── helpers/                  # General helper functions
│   │   ├── arrayHelpers.ts
│   │   ├── objectHelpers.ts
│   │   ├── stringHelpers.ts
│   │   └── index.ts
│   └── index.ts
│
├── assets/                       # Static assets
│   ├── images/                   # Image files
│   │   ├── logos/
│   │   ├── icons/
│   │   └── illustrations/
│   ├── fonts/                    # Font files
│   └── videos/                   # Video files
│
├── config/                       # Application configuration
│   ├── env.ts                    # Environment configuration
│   ├── constants.ts              # App-wide constants
│   └── index.ts
│
├── __tests__/                    # Global test utilities and setup
│   ├── __mocks__/                # Mock files
│   │   ├── handlers.ts           # MSW handlers
│   │   └── server.ts             # MSW server setup
│   ├── utils/                    # Test utilities
│   │   ├── renderWithProviders.tsx
│   │   ├── testUtils.ts
│   │   └── index.ts
│   └── setupTests.ts             # Test setup file
│
├── main.tsx                      # Application entry point
└── vite-env.d.ts                 # Vite type declarations

# Root level files:
├── .env                          # Environment variables
├── .env.local
├── .env.production
├── .gitignore
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── index.html                   # HTML template
├── package.json
├── README.md
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # Node-specific TS config
├── vite.config.ts               # Vite configuration
├── vitest.config.ts             # Vitest configuration
└── tailwind.config.js           # Tailwind CSS config (if using)