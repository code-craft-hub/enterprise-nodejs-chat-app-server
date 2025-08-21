import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { preloadRoutes } from '../../utils/preloadRoutes';

const navigationItems = [
  { path: '/', label: 'Home', preload: preloadRoutes.home },
  { path: '/dashboard', label: 'Dashboard', preload: preloadRoutes.dashboard },
  { path: '/profile', label: 'Profile', preload: preloadRoutes.profile },
  { path: '/settings', label: 'Settings', preload: preloadRoutes.settings },
  { path: '/chat', label: 'Chat', preload: preloadRoutes.chat },
];

export const Navigation = memo(() => {
  const location = useLocation();

  return (
    <nav className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Menu</h2>
        <ul className="space-y-2">
          {navigationItems.map(({ path, label, preload }) => (
            <li key={path}>
              <Link
                to={path}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onMouseEnter={preload} // Preload on hover
                onFocus={preload} // Preload on focus for keyboard users
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';