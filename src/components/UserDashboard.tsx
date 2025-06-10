
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, TrendingUp, Heart, BarChart3, PlusCircle, Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminPollApproval from './AdminPollApproval';

interface UserStats {
  pollsCreated: number;
  votesCast: number;
  favoritePolls: number;
}

interface RecentPoll {
  id: string;
  title: string;
  created_at: string;
  category: string | null;
}

interface RecentVote {
  id: string;
  created_at: string;
  poll_id: string;
  poll?: {
    id: string;
    title: string;
  };
}

const UserDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    pollsCreated: 0,
    votesCast: 0,
    favoritePolls: 0
  });
  const [recentPolls, setRecentPolls] = useState<RecentPoll[]>([]);
  const [recentVotes, setRecentVotes] = useState<RecentVote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentActivity();
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

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      // Fetch recent polls created by user
      const { data: polls } = await supabase
        .from('polls')
        .select('id, title, created_at, category')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent votes with poll information
      const { data: votes } = await supabase
        .from('votes')
        .select(`
          id,
          created_at,
          poll_id,
          polls!inner(id, title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPolls(polls || []);
      
      // Transform votes data to match our interface
      const transformedVotes = votes?.map(vote => ({
        id: vote.id,
        created_at: vote.created_at,
        poll_id: vote.poll_id,
        poll: {
          id: vote.polls.id,
          title: vote.polls.title
        }
      })) || [];
      
      setRecentVotes(transformedVotes);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handlePollClick = (pollId: string) => {
    // Navigate to the poll - we'll use the main page with poll navigation
    navigate(`/?poll=${pollId}`);
  };

  const handleVoteClick = (pollId: string) => {
    // Navigate to the poll where the vote was cast
    navigate(`/?poll=${pollId}`);
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Polls</CardTitle>
              <CardDescription>Your latest created polls</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPolls.length > 0 ? (
                <div className="space-y-2">
                  {recentPolls.map((poll) => (
                    <div 
                      key={poll.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
                      onClick={() => handlePollClick(poll.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                            {poll.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {poll.category} • {new Date(poll.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No polls created yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Votes</CardTitle>
              <CardDescription>Your latest poll interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVotes.length > 0 ? (
                <div className="space-y-2">
                  {recentVotes.map((vote) => (
                    <div 
                      key={vote.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
                      onClick={() => handleVoteClick(vote.poll_id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                            {vote.poll?.title || "Unknown Poll"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Voted on {new Date(vote.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No votes cast yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
