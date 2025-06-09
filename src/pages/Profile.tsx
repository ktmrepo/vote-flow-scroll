
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileStats from '@/components/ProfileStats';
import ProfileInfo from '@/components/ProfileInfo';
import ProfileActivity from '@/components/ProfileActivity';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const [profile, setProfile] = useState(null);
  const [userPolls, setUserPolls] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
  });

  const fetchProfile = useCallback(async () => {
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
        website: data.website || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const fetchUserPolls = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching user polls:', error);
    }
  }, [user]);

  const fetchUserVotes = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  }, [user]);

  const updateProfile = useCallback(async (newFormData) => {
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
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  }, [user, toast, fetchProfile]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        await Promise.all([fetchProfile(), fetchUserPolls(), fetchUserVotes()]);
        setLoading(false);
      };
      fetchData();
    }
  }, [user, fetchProfile, fetchUserPolls, fetchUserVotes]);

  const pollsCount = useMemo(() => userPolls.length, [userPolls]);
  const votesCount = useMemo(() => userVotes.length, [userVotes]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600">Please sign in to view your profile.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
        <Navbar />
        <LoadingSpinner message="Loading profile..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-8 flex-1">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Information */}
        {profile && (
          <ProfileInfo 
            profile={profile}
            email={user.email ?? ''} 
            formData={formData}
            onSubmit={updateProfile}
            onSignOut={signOut}
            updating={updating}
          />
        )}

        {/* User Statistics */}
        <ProfileStats 
          pollsCount={pollsCount} 
          votesCount={votesCount}
          userRole={profile?.role || 'user'}
        />

        {/* Recent Activity */}
        <ProfileActivity polls={userPolls} votes={userVotes} />
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
