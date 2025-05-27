
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, History, Heart, Plus, TrendingUp } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

interface VoteHistory {
  id: string;
  poll_id: string;
  option_id: string;
  created_at: string;
  poll_title: string;
  option_text: string;
}

interface UserStats {
  totalVotes: number;
  pollsCreated: number;
  favoritePolls: number;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalVotes: 0, pollsCreated: 0, favoritePolls: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
      fetchVoteHistory();
      fetchUserStats();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || ''
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          poll_id,
          option_id,
          created_at,
          polls!inner(title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to get poll titles and option text
      const historyWithDetails = await Promise.all(
        (data || []).map(async (vote: any) => {
          // Get poll details to find option text
          const { data: pollData } = await supabase
            .from('polls')
            .select('options')
            .eq('id', vote.poll_id)
            .single();

          let optionText = 'Unknown option';
          if (pollData?.options && Array.isArray(pollData.options)) {
            const option = pollData.options.find((opt: any) => opt.id === vote.option_id);
            optionText = option?.text || 'Unknown option';
          }
          
          return {
            id: vote.id,
            poll_id: vote.poll_id,
            option_id: vote.option_id,
            created_at: vote.created_at,
            poll_title: vote.polls.title,
            option_text: optionText
          };
        })
      );

      setVoteHistory(historyWithDetails);
    } catch (error: any) {
      console.error('Error fetching vote history:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get total votes
      const { count: voteCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get polls created (if user is admin)
      const { count: pollCount } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      setUserStats({
        totalVotes: voteCount || 0,
        pollsCreated: pollCount || 0,
        favoritePolls: 0 // Will implement favorites later
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Polls
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="history">Vote History</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Manage your personal information and preferences
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setEditing(!editing)}
                    variant={editing ? "outline" : "default"}
                  >
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://yoursite.com"
                      />
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="text-gray-900">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-gray-900">{profile?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Bio</Label>
                      <p className="text-gray-900">{formData.bio || 'No bio set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <p className="text-gray-900">{formData.location || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Website</Label>
                      <p className="text-gray-900">{formData.website || 'Not set'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Vote History
                </CardTitle>
                <CardDescription>
                  Your recent voting activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {voteHistory.length > 0 ? (
                  <div className="space-y-4">
                    {voteHistory.map((vote) => (
                      <div
                        key={vote.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{vote.poll_title}</h4>
                            <p className="text-sm text-gray-600">Voted for: {vote.option_text}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(vote.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No votes yet. Start voting on polls!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalVotes}</div>
                  <p className="text-xs text-muted-foreground">
                    Polls you've participated in
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Polls Created</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.pollsCreated}</div>
                  <p className="text-xs text-muted-foreground">
                    Polls you've created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favorite Polls</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.favoritePolls}</div>
                  <p className="text-xs text-muted-foreground">
                    Polls you've bookmarked
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
