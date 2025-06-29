import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Home, Contact, LogIn, UserPlus, LogOut, ChevronDown } from 'lucide-react';
import MobileNavbar from './MobileNavbar';
import AuthModal from './AuthModal';
import AdminUserPanel from './AdminUserPanel';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const categories = [
    'Technology',
    'Entertainment', 
    'Food & Drink',
    'Health & Fitness',
    'Education',
    'Travel',
    'Lifestyle',
    'Gaming',
    'Music',
    'Sports'
  ];

  const handleUserNameClick = () => {
    if (isAdmin) {
      setShowAdminPanel(true);
    }
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                WPCS Poll
              </button>
            </div>

            {/* Desktop Menu Bar - Hidden on mobile */}
            <div className="hidden lg:block">
              <Menubar className="border-0 bg-transparent">
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center space-x-2 cursor-pointer">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={() => navigate('/')}>
                      Latest Polls
                    </MenubarItem>
                    <MenubarItem onClick={() => navigate('/?sort=trending')}>
                      Trending
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer">Categories</MenubarTrigger>
                  <MenubarContent>
                    {categories.map((category) => (
                      <MenubarItem 
                        key={category}
                        onClick={() => navigate(`/?category=${encodeURIComponent(category)}`)}
                      >
                        {category}
                      </MenubarItem>
                    ))}
                    <MenubarSeparator />
                    <MenubarItem onClick={() => navigate('/')}>
                      All Categories
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer">Popular Polls</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={() => navigate('/?sort=popular')}>
                      Most Voted
                    </MenubarItem>
                    <MenubarItem onClick={() => navigate('/?sort=recent')}>
                      Recent
                    </MenubarItem>
                    <MenubarItem onClick={() => navigate('/?sort=trending')}>
                      Trending Today
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger className="flex items-center space-x-2 cursor-pointer">
                    <Contact className="w-4 h-4" />
                    <span>Contact</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>
                      Support
                    </MenubarItem>
                    <MenubarItem>
                      Feedback
                    </MenubarItem>
                    <MenubarItem>
                      About Us
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>

            {/* Desktop Auth Buttons - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-4">
              {!user ? (
                <div className="flex space-x-2">
                  <AuthModal defaultTab="signin">
                    <Button variant="outline" size="sm">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </AuthModal>
                  <AuthModal defaultTab="signup">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </AuthModal>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleUserNameClick}
                    className={`text-sm text-gray-600 max-w-32 truncate hover:text-gray-800 transition-colors flex items-center gap-1 ${
                      isAdmin ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    Welcome, {user.user_metadata?.full_name || user.email}
                    {isAdmin && <ChevronDown className="w-3 h-3" />}
                  </button>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <MobileNavbar />
          </div>
        </div>
      </div>

      {/* Admin User Panel */}
      <AdminUserPanel 
        isOpen={showAdminPanel} 
        onClose={() => setShowAdminPanel(false)} 
      />
    </>
  );
};

export default Navbar;