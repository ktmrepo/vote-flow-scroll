
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import PollCard from '@/components/PollCard';
import UserDashboard from '@/components/UserDashboard';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import PollNavigation from '@/components/PollNavigation';
import { seedVoteData } from '@/utils/seedVoteData';

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
    // Auto-advance is handled in PollCard component
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

  // Seed vote data
  useEffect(() => {
    if (polls.length > 0) {
      // Only call once when polls are loaded
      seedVoteData().then((votesAdded) => {
        if (votesAdded > 0) {
          console.log(`Added ${votesAdded} simulated votes to demonstrate engagement`);
        }
      });
    }
  }, [polls.length]);

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
        {/* User Dashboard Sidebar - Only for authenticated users */}
        {user && (
          <>
            {/* Mobile overlay */}
            {showUserPanel && (
              <div 
                className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
                onClick={() => setShowUserPanel(false)} 
              />
            )}
            
            {/* Sidebar */}
            <div className={`
              fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none
              ${showUserPanel ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <UserDashboard />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Hamburger Menu Toggle (only for authenticated users) */}
          {user && (
            <div className="fixed top-20 left-4 z-30 lg:hidden">
              <Button
                onClick={() => setShowUserPanel(!showUserPanel)}
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-md hover:bg-white p-2"
              >
                {showUserPanel ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          )}

          {/* Navigation arrows positioned on sides of poll card */}
          <PollNavigation 
            currentIndex={currentPollIndex} 
            totalPolls={filteredPolls.length} 
            onPrevious={prevPoll} 
            onNext={nextPoll}
          />

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
        </div>
      </div>
    </div>
  );
};

export default Index;
