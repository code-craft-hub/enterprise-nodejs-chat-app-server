import { lazy, type ComponentType } from "react";

export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallbackComponent?: ComponentType
) => {
  return lazy(() =>
    importFn().catch(() => ({
      default: fallbackComponent || (() => <div>Failed to load component</div>),
    }))
  );
};

export const prefetchRoute = (importFn: () => Promise<any>) => {
  // Prefetch but don't block
  importFn().catch(() => {
    // Silently fail - component will load when actually needed
  });
};
