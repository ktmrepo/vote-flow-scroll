
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileForm from '@/components/ProfileForm';
import ProfileActivity from '@/components/ProfileActivity';
import { User } from 'lucide-react';

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

  const updateProfile = async (newFormData: typeof formData) => {
    if (!user) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: newFormData.full_name,
          bio: newFormData.bio,
          location: newFormData.location,
          website: newFormData.website,
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
            {profile && (
              <ProfileForm 
                email={user.email ?? ''} 
                initialValues={formData}
                createdAt={profile.created_at}
                onSubmit={updateProfile}
                onSignOut={signOut}
                updating={updating}
              />
            )}
          </CardContent>
        </Card>

        {/* User Statistics */}
        <ProfileHeader 
          pollsCount={userPolls.length} 
          votesCount={userVotes.length}
          userRole={profile?.role || 'user'}
        />

        {/* Recent Activity */}
        <ProfileActivity polls={userPolls} votes={userVotes} />
      </div>
    </div>
  );
};

export default Profile;
