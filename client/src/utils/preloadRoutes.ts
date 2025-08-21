import { lazy } from "react";

// Lazy load components
const HomePage = lazy(() => import("../pages/HomePage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const ChatPage = lazy(() => import("../pages/ChatPage"));

// Preload functions
export const preloadRoutes = {
  home: () => import("../pages/HomePage"),
  chat: () => import("../pages/ChatPage"),
  dashboard: () => import("../pages/DashboardPage"),
  profile: () => import("../pages/ProfilePage"),
  settings: () => import("../pages/SettingsPage"),
};

// Export lazy components
export { HomePage, DashboardPage, ProfilePage, SettingsPage, ChatPage };
