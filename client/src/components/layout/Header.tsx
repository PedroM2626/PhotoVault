import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              PhotoVault
            </Link>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900">
                Gallery
              </Link>
              <Link to="/albums" className="text-gray-700 hover:text-gray-900">
                Albums
              </Link>
              <Link to="/upload" className="text-gray-700 hover:text-gray-900">
                Upload
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hello, {user?.username}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};