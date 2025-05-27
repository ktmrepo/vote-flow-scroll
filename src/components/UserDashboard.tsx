
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  PlusCircle, 
  History, 
  Heart, 
  BarChart3, 
  Settings,
  LogOut,
  Key
} from 'lucide-react';

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: BarChart3,
      title: 'Dashboard',
      description: 'View your polling activity',
      onClick: () => navigate('/profile'),
      color: 'bg-blue-500'
    },
    {
      icon: PlusCircle,
      title: 'Create Poll',
      description: 'Submit a new poll for review',
      onClick: () => navigate('/submit'),
      color: 'bg-green-500'
    },
    {
      icon: History,
      title: 'Vote History',
      description: 'See your voting history',
      onClick: () => navigate('/profile'),
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Favorites',
      description: 'Your bookmarked polls',
      onClick: () => navigate('/profile'),
      color: 'bg-red-500'
    },
    {
      icon: User,
      title: 'Profile Settings',
      description: 'Manage your profile',
      onClick: () => navigate('/profile'),
      color: 'bg-gray-500'
    },
    {
      icon: Key,
      title: 'Reset Password',
      description: 'Change your password',
      onClick: () => {
        // TODO: Implement password reset
        console.log('Password reset functionality to be implemented');
      },
      color: 'bg-orange-500'
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {user?.user_metadata?.full_name || user?.email}
        </h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
            onClick={item.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserDashboard;
