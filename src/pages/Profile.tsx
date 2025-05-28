
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Mail, MapPin, Globe, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  color: string;
}

interface UserPoll {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  created_at: string;
  options: PollOption[];
}

interface UserVote {
  id: string;
  created_at: string;
  option_id: string;
  poll: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    options: PollOption[];
  };
}

// Helper function to safely convert Json to PollOption array
const convertJsonToPollOptions = (jsonData: any): PollOption[] => {
  if (!Array.isArray(jsonData)) return [];
  
  return jsonData.filter((item): item is PollOption => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.text === 'string' &&
      typeof item.votes === 'number' &&
      typeof item.color === 'string'
    );
  });
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPolls, setUserPolls] = useState<UserPoll[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPolls();
      fetchUserVotes();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const typedProfile = data as UserProfile;
      setProfile(typedProfile);
      setFormData({
        full_name: typedProfile.full_name || '',
        bio: typedProfile.bio || '',
        location: typedProfile.location || '',
        website: typedProfile.website || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchUserPolls = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedPolls = data?.map(poll => ({
        ...poll,
        options: convertJsonToPollOptions(poll.options)
      })) || [];

      setUserPolls(typedPolls);
    } catch (error: any) {
      console.error('Error fetching user polls:', error);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          poll:polls(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedVotes = data?.map(vote => ({
        ...vote,
        poll: {
          ...vote.poll,
          options: convertJsonToPollOptions(vote.poll?.options)
        }
      })) || [];

      setUserVotes(typedVotes);
    } catch (error: any) {
      console.error('Error fetching user votes:', error);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [profile, userPolls, userVotes]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600">Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and bio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Your location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Member since {profile ? new Date(profile.created_at).toLocaleDateString() : ''}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{userPolls.length}</div>
              <div className="text-sm text-gray-600">Polls Created</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{userVotes.length}</div>
              <div className="text-sm text-gray-600">Votes Cast</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{profile?.role}</div>
              <div className="text-sm text-gray-600">Account Type</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Polls</CardTitle>
            </CardHeader>
            <CardContent>
              {userPolls.length > 0 ? (
                <div className="space-y-3">
                  {userPolls.slice(0, 5).map((poll) => (
                    <div key={poll.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">{poll.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {poll.category} • {new Date(poll.created_at).toLocaleDateString()}
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
              <CardTitle>Recent Votes</CardTitle>
            </CardHeader>
            <CardContent>
              {userVotes.length > 0 ? (
                <div className="space-y-3">
                  {userVotes.slice(0, 5).map((vote) => (
                    <div key={vote.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">{vote.poll?.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Voted on {new Date(vote.created_at).toLocaleDateString()}
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

export default Profile;
