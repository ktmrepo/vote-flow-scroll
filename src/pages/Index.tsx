
import { useState, useEffect, useRef } from 'react';
import { pollData } from '@/data/pollData';
import PollCard from '@/components/PollCard';
import ScrollIndicator from '@/components/ScrollIndicator';

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
  const [randomizedPolls, setRandomizedPolls] = useState(() => shuffleArray(pollData));
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Randomize polls on page reload
  useEffect(() => {
    setRandomizedPolls(shuffleArray(pollData));
  }, []);

  // Function to handle navigation
  const navigatePoll = (direction: 'next' | 'prev') => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    
    if (direction === 'next') {
      setCurrentPollIndex((prev) => 
        prev < randomizedPolls.length - 1 ? prev + 1 : prev
      );
    } else {
      setCurrentPollIndex((prev) => 
        prev > 0 ? prev - 1 : prev
      );
    }
    
    // Reset scrolling flag after animation
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 800);
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
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolling, randomizedPolls.length]);

  // Handle manual navigation button clicks
  const handleNextPoll = () => navigatePoll('next');
  const handlePrevPoll = () => navigatePoll('prev');

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
            <div className="text-sm text-gray-600">
              Scroll to explore • Use ↑↓ keys • Swipe on mobile
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
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex space-x-4">
        <button 
          onClick={handlePrevPoll}
          disabled={currentPollIndex === 0 || isScrolling}
          className={`px-6 py-2 rounded-full shadow-lg transition-all duration-300 ${
            currentPollIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100 active:scale-95'
          }`}
        >
          Previous
        </button>
        <button 
          onClick={handleNextPoll}
          disabled={currentPollIndex === randomizedPolls.length - 1 || isScrolling}
          className={`px-6 py-2 rounded-full shadow-lg transition-all duration-300 ${
            currentPollIndex === randomizedPolls.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100 active:scale-95'
          }`}
        >
          Next
        </button>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator 
        currentPoll={currentPollIndex} 
        totalPolls={randomizedPolls.length} 
      />

      {/* Navigation Hints */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 rounded border flex items-center justify-center">
                ↑
              </div>
              <span>Previous</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 rounded border flex items-center justify-center">
                ↓
              </div>
              <span>Next</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
