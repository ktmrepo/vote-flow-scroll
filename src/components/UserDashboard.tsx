
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  TrendingUp, 
  Plus, 
  Heart, 
  LogOut, 
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface PendingPoll {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  created_by: string;
  options: Array<{
    id: string;
    text: string;
  }>;
}

const UserDashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingPolls, setPendingPolls] = useState<PendingPoll[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingPolls();
    }
  }, [isAdmin]);

  const fetchPendingPolls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedPolls = data?.map(poll => ({
        ...poll,
        options: Array.isArray(poll.options) ? poll.options as Array<{
          id: string;
          text: string;
        }> : []
      })) || [];
      
      setPendingPolls(typedPolls);
    } catch (error: any) {
      console.error('Error fetching pending polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePollApproval = async (pollId: string, approve: boolean) => {
    try {
      if (approve) {
        const { error } = await supabase
          .from('polls')
          .update({ is_active: true })
          .eq('id', pollId);

        if (error) throw error;
        
        toast({
          title: "Poll approved",
          description: "The poll has been activated and is now visible to users.",
        });
      } else {
        const { error } = await supabase
          .from('polls')
          .delete()
          .eq('id', pollId);

        if (error) throw error;
        
        toast({
          title: "Poll rejected",
          description: "The poll has been removed from the system.",
        });
      }
      
      fetchPendingPolls();
    } catch (error: any) {
      toast({
        title: "Error processing poll",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 h-screen p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to WPCS Poll</h2>
          <p className="text-gray-600 mb-6">Sign in to access your dashboard</p>
          <Link to="/auth">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{user.email}</h3>
            {isAdmin && (
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2 mb-6">
          <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Profile</span>
          </Link>
          <Link to="/submit" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <Plus className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Submit Poll</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Stats Cards */}
        <div className="space-y-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">Polls voted on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-gray-500">Your bookmarked polls</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Section - Poll Approval */}
        {isAdmin && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending Polls ({pendingPolls.length})
            </h4>
            {loading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : pendingPolls.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingPolls.map((poll) => (
                  <Card key={poll.id} className="p-3">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-gray-900 line-clamp-2">{poll.title}</h5>
                      <div className="text-xs text-gray-500">
                        {poll.category} • {new Date(poll.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handlePollApproval(poll.id, true)}
                          className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handlePollApproval(poll.id, false)}
                          className="flex-1 h-8 text-xs"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No pending polls</p>
            )}
          </div>
        )}

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default UserDashboard;
