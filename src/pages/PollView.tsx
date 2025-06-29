import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import { useVotes } from '@/hooks/useVotes';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PollCard from '@/components/PollCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PollNavigation from '@/components/PollNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PollView = () => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { polls, loading } = usePolls();
  const [currentPoll, setCurrentPoll] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryPolls, setCategoryPolls] = useState([]);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAdvanceMessage, setShowAdvanceMessage] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { userVote } = useVotes(pollId);

  useEffect(() => {
    if (polls.length > 0 && pollId) {
      const poll = polls.find(p => p.id === pollId);
      if (poll) {
        setCurrentPoll(poll);
        
        // Get polls from the same category
        const sameCategoryPolls = polls.filter(p => p.category === poll.category);
        setCategoryPolls(sameCategoryPolls);
        
        // Find current index in category polls
        const index = sameCategoryPolls.findIndex(p => p.id === pollId);
        setCurrentIndex(index !== -1 ? index : 0);
      }
    }
  }, [polls, pollId]);

  const navigateWithAnimation = (targetPoll) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      const titleSlug = targetPoll.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 50);
      navigate(`/poll/${targetPoll.id}/${titleSlug}`);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };

  const nextPoll = () => {
    if (currentIndex < categoryPolls.length - 1) {
      const nextPollData = categoryPolls[currentIndex + 1];
      navigateWithAnimation(nextPollData);
    } else {
      // If at the end, go to a random poll from the same category
      const randomIndex = Math.floor(Math.random() * categoryPolls.length);
      const randomPoll = categoryPolls[randomIndex];
      if (randomPoll && randomPoll.id !== pollId) {
        navigateWithAnimation(randomPoll);
      }
    }
  };

  const prevPoll = () => {
    if (currentIndex > 0) {
      const prevPollData = categoryPolls[currentIndex - 1];
      navigateWithAnimation(prevPollData);
    } else {
      // If at the beginning, go to the last poll
      const lastPoll = categoryPolls[categoryPolls.length - 1];
      if (lastPoll) {
        navigateWithAnimation(lastPoll);
      }
    }
  };

  const handleVote = () => {
    // Clear any existing timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }

    // Show the advance message
    setShowAdvanceMessage(true);

    // Set a 5-second timer to advance to next poll
    const timer = setTimeout(() => {
      setShowAdvanceMessage(false);
      nextPoll();
    }, 5000);
    
    setAutoAdvanceTimer(timer);
  };

  const cancelAutoAdvance = () => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
    setShowAdvanceMessage(false);
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  // Clear timer when navigating away
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [pollId]);

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

          {/* Navigation buttons for category polls */}
          {categoryPolls.length > 1 && (
            <PollNavigation 
              currentIndex={currentIndex} 
              totalPolls={categoryPolls.length} 
              onPrevious={prevPoll} 
              onNext={nextPoll}
            />
          )}

          <div className="w-full">
            <div 
              className={`relative transition-all duration-300 ${
                isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
              }`}
            >
              <PollCard
                poll={currentPoll}
                isActive={true}
                onVote={handleVote}
              />
              
              {/* Show advance message and already voted notice below options */}
              {(showAdvanceMessage || (user && userVote)) && (
                <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-lg">
                  {user && userVote && (
                    <div className="text-center mb-2">
                      <p className="text-sm text-blue-600 font-medium">
                        ✓ You've already voted on this poll
                      </p>
                    </div>
                  )}
                  
                  {showAdvanceMessage && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Moving to next poll in 5 seconds...
                      </p>
                      <Button
                        onClick={cancelAutoAdvance}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PollView;