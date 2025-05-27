
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
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Home, Menu, Contact, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

          {/* Menu Bar */}
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
                <MenubarItem onClick={() => navigate('/')}>
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

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.full_name || user.email}
                </span>
                <Button
                  onClick={() => navigate('/submit')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Poll
                </Button>
                {user && (
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    size="sm"
                  >
                    Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
