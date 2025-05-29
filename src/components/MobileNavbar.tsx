
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="fixed top-16 right-0 z-50 w-64 bg-white shadow-xl rounded-l-lg p-4 space-y-3">
            <button
              onClick={() => handleNavigation('/')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/?category=technology')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Categories
            </button>
            <button
              onClick={() => handleNavigation('/?popular=true')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Popular Polls
            </button>
            <button
              onClick={() => handleNavigation('/contact')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Contact
            </button>
            
            {user ? (
              <>
                <div className="border-t pt-3">
                  <p className="px-3 py-2 text-sm text-gray-500">Welcome {user.email}</p>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleNavigation('/submit')}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Submit Poll
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t pt-3">
                <button
                  onClick={() => handleNavigation('/auth')}
                  className="block w-full text-left px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNavbar;
