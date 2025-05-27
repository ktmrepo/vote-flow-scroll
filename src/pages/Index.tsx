
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import PollCard from '@/components/PollCard';
import ScrollIndicator from '@/components/ScrollIndicator';
import UserDashboard from '@/components/UserDashboard';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';

const Index = () => {
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const { polls, loading } = usePolls();
  const { user } = useAuth();
  const navigate = useNavigate();

  const nextPoll = () => {
    if (currentPollIndex < polls.length - 1) {
      setCurrentPollIndex(currentPollIndex + 1);
    }
  };

  const prevPoll = () => {
    if (currentPollIndex > 0) {
      setCurrentPollIndex(currentPollIndex - 1);
    }
  };

  const handleVote = () => {
    // Automatically move to next poll after voting
    setTimeout(() => {
      nextPoll();
    }, 2000);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPoll();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPoll();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPollIndex, polls.length]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchStartX - touchEndX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          nextPoll();
        } else {
          prevPoll();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPollIndex, polls.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No polls available</h2>
          <p className="text-gray-600 mb-8">Check back later for new polls!</p>
          {user && (
            <Button onClick={() => navigate('/submit')} className="bg-blue-600 hover:bg-blue-700">
              Submit a Poll
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* User Dashboard Sidebar */}
      {user && showUserPanel && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          <div className="lg:hidden absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowUserPanel(false)} />
          <div className="relative bg-white h-full overflow-y-auto">
            <UserDashboard />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-40 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {user && (
                <Button
                  onClick={() => setShowUserPanel(!showUserPanel)}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm"
                >
                  {showUserPanel ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              )}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WPCS Poll
              </h1>
            </div>
            
            {!user ? (
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.full_name || user.email}
                </span>
                <Button
                  onClick={() => navigate('/submit')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Poll
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Poll Cards */}
        <div className="relative">
          {polls.map((poll, index) => (
            <div
              key={poll.id}
              className={`${
                index === currentPollIndex ? 'block' : 'hidden'
              }`}
            >
              <PollCard
                poll={poll}
                isActive={index === currentPollIndex}
                onVote={handleVote}
              />
            </div>
          ))}
        </div>

        {/* Navigation Instructions */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-gray-500 text-sm mb-2">
            Use arrow keys, swipe, or click to navigate
          </p>
          <div className="flex space-x-2">
            <button
              onClick={prevPoll}
              disabled={currentPollIndex === 0}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-white/90 transition-all"
            >
              ←
            </button>
            <button
              onClick={nextPoll}
              disabled={currentPollIndex === polls.length - 1}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-white/90 transition-all"
            >
              →
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator 
          currentIndex={currentPollIndex} 
          total={polls.length}
          onIndexChange={setCurrentPollIndex}
        />
      </div>
    </div>
  );
};

export default Index;
