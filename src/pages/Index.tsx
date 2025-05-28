
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import PollCard from '@/components/PollCard';
import UserDashboard from '@/components/UserDashboard';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Index = () => {
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [searchParams] = useSearchParams();
  const { polls, loading } = usePolls();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter polls based on URL parameters
  const filteredPolls = polls.filter(poll => {
    const category = searchParams.get('category');
    if (category && poll.category !== category) return false;
    return true;
  });

  const nextPoll = () => {
    if (currentPollIndex < filteredPolls.length - 1) {
      setCurrentPollIndex(currentPollIndex + 1);
    }
  };

  const prevPoll = () => {
    if (currentPollIndex > 0) {
      setCurrentPollIndex(currentPollIndex - 1);
    }
  };

  const handleVote = () => {
    // The auto-advance is now handled in PollCard component
    // This function is called when the timer expires
    nextPoll();
  };

  // Reset current poll index when filters change
  useEffect(() => {
    setCurrentPollIndex(0);
  }, [searchParams]);

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
  }, [currentPollIndex, filteredPolls.length]);

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
  }, [currentPollIndex, filteredPolls.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading polls...</p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredPolls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="flex">
        {/* User Dashboard Sidebar */}
        {user && showUserPanel && (
          <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-80">
            <div className="lg:hidden absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowUserPanel(false)} />
            <div className="relative bg-white h-full overflow-y-auto lg:w-80">
              <UserDashboard />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Hamburger Menu Toggle (only for authenticated users) */}
          {user && (
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-40">
              <Button
                onClick={() => setShowUserPanel(!showUserPanel)}
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm p-2 sm:p-3"
              >
                {showUserPanel ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          )}

          {/* Poll Cards */}
          <div className="relative">
            {filteredPolls.map((poll, index) => (
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

          {/* Navigation Controls */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-gray-500 text-xs sm:text-sm mb-2">
              Use arrow keys, swipe, or click to navigate
            </p>
            <div className="flex space-x-2">
              <button
                onClick={prevPoll}
                disabled={currentPollIndex === 0}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-white/90 transition-all text-sm sm:text-base"
              >
                ←
              </button>
              <div className="flex items-center px-3 py-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-xs sm:text-sm">
                {currentPollIndex + 1} / {filteredPolls.length}
              </div>
              <button
                onClick={nextPoll}
                disabled={currentPollIndex === filteredPolls.length - 1}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center disabled:opacity-50 hover:bg-white/90 transition-all text-sm sm:text-base"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
