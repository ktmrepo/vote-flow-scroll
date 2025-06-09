
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
    return null;
  }

  return (
    <div {...handlers} className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-300 ease-in-out"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${polls.length * 100}%`
        }}
      >
        {polls.map((poll, index) => (
          <div
            key={poll.id}
            className="w-full flex-shrink-0"
            style={{ width: `${100 / polls.length}%` }}
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
