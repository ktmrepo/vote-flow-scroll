
import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { DatabasePoll } from '@/hooks/usePolls';
import PollCard from './PollCard';

interface SwipeablePollContainerProps {
  polls: DatabasePoll[];
  currentIndex: number;
  onVote: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SwipeablePollContainer = ({ 
  polls, 
  currentIndex, 
  onVote,
  onNext,
  onPrevious
}: SwipeablePollContainerProps) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < polls.length - 1) {
        onNext();
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        onPrevious();
      }
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 50,
  });

  if (!polls || polls.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No polls available</p>
          <p className="text-gray-400 text-sm mt-2">Check back later for new polls!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden" {...handlers}>
      <div 
        className="flex transition-transform duration-300 ease-in-out w-full"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {polls.map((poll, index) => (
          <div
            key={poll.id}
            className="w-full flex-shrink-0 min-h-screen md:min-h-0"
          >
            <PollCard
              poll={poll}
              isActive={index === currentIndex}
              onVote={onVote}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeablePollContainer;
