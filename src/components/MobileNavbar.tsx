
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Contact, LogIn, UserPlus, User, PlusCircle, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

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

  return (
    <div className="lg:hidden">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="text-center border-b pb-4">
            <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WPCS Poll
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="flex flex-col h-full overflow-y-auto p-4 space-y-2">
            {/* Auth Section - Now at the top */}
            <div className="border-b pb-4 mb-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </button>
                  <button
                    onClick={() => handleNavigation('/submit')}
                    className="flex items-center w-full text-left px-3 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-3" />
                    Submit Poll
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigation('/auth')}
                    className="flex items-center w-full justify-center px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation('/auth')}
                    className="flex items-center w-full justify-center px-3 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Home Section */}
            <div className="space-y-1">
              <button
                onClick={() => handleNavigation('/')}
                className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 mr-3" />
                Latest Polls
              </button>
              <button
                onClick={() => handleNavigation('/?sort=trending')}
                className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-6"
              >
                Trending
              </button>
            </div>

            {/* Categories Section with Collapsible */}
            <div className="space-y-1">
              <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="font-medium">All Categories</span>
                    {categoriesOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleNavigation(`/?category=${encodeURIComponent(category)}`)}
                      className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-6"
                    >
                      {category}
                    </button>
                  ))}
                  <button
                    onClick={() => handleNavigation('/')}
                    className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-6"
                  >
                    View All
                  </button>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Popular Polls Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Popular
              </div>
              <button
                onClick={() => handleNavigation('/?sort=popular')}
                className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-3"
              >
                Most Voted
              </button>
              <button
                onClick={() => handleNavigation('/?sort=recent')}
                className="flex items-center w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-3"
              >
                Recent
              </button>
            </div>

            {/* Contact */}
            <button
              onClick={() => handleNavigation('/contact')}
              className="flex items-center w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Contact className="w-5 h-5 mr-3" />
              Contact
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNavbar;
