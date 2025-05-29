
import React from 'react';
import { DatabasePoll } from '@/hooks/usePolls';
import PollCard from './PollCard';

interface PollContainerProps {
  polls: DatabasePoll[];
  currentIndex: number;
  onVote: () => void;
}

const PollContainer = ({ polls, currentIndex, onVote }: PollContainerProps) => {
  return (
    <div className="relative">
      {polls.map((poll, index) => (
        <div
          key={poll.id}
          className={`${
            index === currentIndex ? 'block' : 'hidden'
          }`}
        >
          <PollCard
            poll={poll}
            isActive={index === currentIndex}
            onVote={onVote}
          />
        </div>
      ))}
    </div>
  );
};

export default PollContainer;
