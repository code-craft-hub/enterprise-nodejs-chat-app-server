import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { AppProvider } from "./providers/AppProvider";
import { Layout } from "./components/layout/Layout";

const HomePage = lazy(() =>
  import("./pages/HomePage").catch(() => ({
    default: () => <div>Error loading Home Page</div>,
  }))
);

const DashboardPage = lazy(() => import("./pages/DashboardPage"));

const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <HomePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ProfilePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <SettingsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ChatPage />
                    </Suspense>
                  }
                />
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
