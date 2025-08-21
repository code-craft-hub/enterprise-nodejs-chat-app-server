import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteConfig {
  path: string;
  preloader: () => Promise<any>;
  prefetch?: boolean;
}

export function useRoutePreloader(routes: RouteConfig[]) {
  const location = useLocation();

  useEffect(() => {
    // Preload likely next routes based on current location
    const currentRoute = routes.find(route => route.path === location.pathname);
    
    if (currentRoute?.prefetch) {
      // Add logic to prefetch related routes
      routes
        .filter(route => route.prefetch && route.path !== location.pathname)
        .forEach(route => {
          route.preloader().catch(console.error);
        });
    }
  }, [location.pathname, routes]);

  const preloadRoute = (path: string) => {
    const route = routes.find(r => r.path === path);
    if (route) {
      route.preloader().catch(console.error);
    }
  };

  return { preloadRoute };
}