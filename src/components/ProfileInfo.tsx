
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from '@/components/ProfileForm';
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

interface ProfileInfoProps {
  profile: UserProfile;
  email: string;
  formData: {
    full_name: string;
    bio: string;
    location: string;
    website: string;
  };
  onSubmit: (data: any) => void;
  onSignOut: () => void;
  updating: boolean;
}

const ProfileInfo = ({ profile, email, formData, onSubmit, onSignOut, updating }: ProfileInfoProps) => {
  return (
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
        <ProfileForm 
          email={email} 
          initialValues={formData}
          createdAt={profile.created_at}
          onSubmit={onSubmit}
          onSignOut={onSignOut}
          updating={updating}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;
