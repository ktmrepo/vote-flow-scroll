import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PollCard from '@/components/PollCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PollView = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const { polls, loading } = usePolls();
  const [currentPoll, setCurrentPoll] = useState(null);

  useEffect(() => {
    if (polls.length > 0 && pollId) {
      const poll = polls.find(p => p.id === pollId);
      setCurrentPoll(poll || null);
    }
  }, [polls, pollId]);

  const handleVote = () => {
    // After voting, user can navigate back or to next poll
    // For now, just stay on the same poll to show results
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
        <Navbar />
        <LoadingSpinner message="Loading poll..." />
        <Footer />
      </div>
    );
  }

  if (!currentPoll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Poll not found</h2>
            <p className="text-gray-600 mb-6">The poll you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col justify-center items-center relative pb-8 lg:pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 relative">
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          <div className="w-full">
            <PollCard
              poll={currentPoll}
              isActive={true}
              onVote={handleVote}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PollView;