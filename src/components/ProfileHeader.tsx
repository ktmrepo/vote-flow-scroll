
import React from 'react';
import ProfileStats from './ProfileStats';

interface ProfileHeaderProps {
  pollsCount: number;
  votesCount: number;
  userRole: string;
}

const ProfileHeader = ({ pollsCount, votesCount, userRole }: ProfileHeaderProps) => {
  return <ProfileStats pollsCount={pollsCount} votesCount={votesCount} userRole={userRole} />;
};

export default ProfileHeader;
