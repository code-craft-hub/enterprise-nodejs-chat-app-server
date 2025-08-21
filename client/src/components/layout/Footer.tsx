import { memo } from 'react';

export const Footer = memo(() => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="px-6 text-center">
        <p className="text-sm">
          © 2025 Advanced React App. Built with performance in mind.
        </p>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';