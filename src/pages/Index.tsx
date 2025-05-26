import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pollData } from '@/data/pollData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PollCard from '@/components/PollCard';

// Fisher-Yates shuffle algorithm to randomize polls
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [randomizedPolls, setRandomizedPolls] = useState(() => shuffleArray(pollData));
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Randomize polls on page reload
  useEffect(() => {
    setRandomizedPolls(shuffleArray(pollData));
  }, []);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check if all polls are voted
  const allPollsVoted = votedPolls.size === randomizedPolls.length;

  // Find next unvoted poll or return next poll if all are voted
  const findNextPoll = (currentIndex: number) => {
    // First, look for unvoted polls after current index
    for (let i = currentIndex + 1; i < randomizedPolls.length; i++) {
      if (!votedPolls.has(i)) {
        return i;
      }
    }
    
    // If no unvoted polls after current, look from beginning
    for (let i = 0; i < currentIndex; i++) {
      if (!votedPolls.has(i)) {
        return i;
      }
    }
    
    // If all polls are voted, just go to next poll
    return currentIndex < randomizedPolls.length - 1 ? currentIndex + 1 : currentIndex;
  };

  // Function to handle navigation
  const navigatePoll = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      const nextIndex = findNextPoll(currentPollIndex);
      if (nextIndex !== currentPollIndex) {
        setCurrentPollIndex(nextIndex);
        setNavigationHistory(prev => [...prev, nextIndex]);
      }
    } else {
      // Go to previous poll in navigation history
      if (navigationHistory.length > 1) {
        const newHistory = [...navigationHistory];
        newHistory.pop(); // Remove current
        const previousIndex = newHistory[newHistory.length - 1];
        setCurrentPollIndex(previousIndex);
        setNavigationHistory(newHistory);
      }
    }
  };

  // Handle when user votes on a poll
  const handleVote = (pollIndex: number) => {
    setVotedPolls(prev => new Set([...prev, pollIndex]));
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      navigatePoll(e.deltaY > 0 ? 'next' : 'prev');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        navigatePoll('next');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigatePoll('prev');
      }
    };

    // Touch event handlers for mobile swiping
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].screenY;
      
      const swipeThreshold = 50;
      const swipeDistance = touchStartY - touchEndY;
      
      if (Math.abs(swipeDistance) > swipeThreshold) {
        navigatePoll(swipeDistance > 0 ? 'next' : 'prev');
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPollIndex, votedPolls, navigationHistory, randomizedPolls.length]);

  // Handle manual navigation button clicks
  const handleNextPoll = () => navigatePoll('next');
  const handlePrevPoll = () => navigatePoll('prev');

  const canGoPrevious = navigationHistory.length > 1;
  const canGoNext = currentPollIndex < randomizedPolls.length - 1 || votedPolls.size < randomizedPolls.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WPCS Poll
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 hidden md:block">
                Swipe up for next • Swipe down for previous • Use ↑↓ keys
              </div>
              {user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="text-sm"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20">
        {randomizedPolls.map((poll, index) => (
          <div
            key={`${poll.id}-${index}`}
            className={`transition-all duration-700 ease-in-out ${
              index === currentPollIndex 
                ? 'opacity-100 transform translate-y-0' 
                : index < currentPollIndex 
                  ? 'opacity-0 transform -translate-y-full' 
                  : 'opacity-0 transform translate-y-full'
            }`}
            style={{
              position: index === currentPollIndex ? 'relative' : 'absolute',
              top: index === currentPollIndex ? 0 : '100vh',
              width: '100%',
            }}
          >
            <PollCard 
              poll={poll} 
              isActive={index === currentPollIndex}
              onVote={() => handleVote(index)}
            />
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {allPollsVoted && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-60 bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200 max-w-md text-center animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">You're killing it!</h3>
          <p className="text-gray-600 text-lg">
            You've now voted on all the available polls. Check later for more polls.
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex space-x-4">
        <button 
          onClick={handlePrevPoll}
          disabled={!canGoPrevious}
          className={`px-6 py-2 rounded-full shadow-lg transition-all duration-300 ${
            !canGoPrevious ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100 active:scale-95'
          }`}
        >
          Previous
        </button>
        <button 
          onClick={handleNextPoll}
          disabled={!canGoNext}
          className={`px-6 py-2 rounded-full shadow-lg transition-all duration-300 ${
            !canGoNext ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100 active:scale-95'
          }`}
        >
          Next
        </button>
      </div>

      {/* Footer */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            WPCS Poll
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
