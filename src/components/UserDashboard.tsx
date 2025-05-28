
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, TrendingUp, Heart, BarChart3, PlusCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPollApproval from './AdminPollApproval';

interface UserStats {
  pollsCreated: number;
  votesCast: number;
  favoritePolls: number;
}

const UserDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    pollsCreated: 0,
    votesCast: 0,
    favoritePolls: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch user's polls
      const { data: polls } = await supabase
        .from('polls')
        .select('id')
        .eq('created_by', user.id);

      // Fetch user's votes
      const { data: votes } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id);

      setStats({
        pollsCreated: polls?.length || 0,
        votesCast: votes?.length || 0,
        favoritePolls: 0 // Placeholder for future feature
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Please sign in to view your dashboard</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <div className="p-4 sm:p-6 space-y-6">
        {/* User Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              {isAdmin && (
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Admin
                </span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
              onClick={() => navigate('/profile')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-xl font-bold text-blue-600">{stats.pollsCreated}</div>
                <div className="text-xs text-gray-600">Polls Created</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-xl font-bold text-green-600">{stats.votesCast}</div>
                <div className="text-xs text-gray-600">Votes Cast</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <div className="text-xl font-bold text-red-600">{stats.favoritePolls}</div>
                <div className="text-xs text-gray-600">Favorites</div>
                <p className="text-xs text-gray-500 mt-1">Your bookmarked polls</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/submit')}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Poll
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Browse Polls
            </Button>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-purple-700">Admin Panel</CardTitle>
              <CardDescription>Manage polls and user content</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminPollApproval />
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Your latest poll interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-4">
              Activity feed coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
