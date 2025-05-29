
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const EmptyPollsState = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">No polls available</h2>
        <p className="text-gray-600 mb-8">Check back later for new polls!</p>
        {user && (
          <Button onClick={() => navigate('/submit')} className="bg-blue-600 hover:bg-blue-700">
            Submit a Poll
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyPollsState;
