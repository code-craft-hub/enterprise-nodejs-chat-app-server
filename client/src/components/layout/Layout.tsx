import React, { memo } from 'react';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = memo<LayoutProps>(({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navigation />
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
});

Layout.displayName = 'Layout';