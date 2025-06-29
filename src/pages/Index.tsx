import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PollNavigation from '@/components/PollNavigation';
import SwipeablePollContainer from '@/components/SwipeablePollContainer';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyPollsState from '@/components/EmptyPollsState';

const Index = () => {
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const { polls, loading } = usePolls();

  console.log('Index component - Polls:', polls, 'Loading:', loading);

  const filteredPolls = polls.filter(poll => {
    const category = searchParams.get('category');
    if (category && poll.category !== category) return false;
    return true;
  });

  console.log('Filtered polls:', filteredPolls);

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
    nextPoll();
  };

  useEffect(() => {
    setCurrentPollIndex(0);
  }, [searchParams]);

  // Handle direct poll navigation from URL
  useEffect(() => {
    const pollId = searchParams.get('poll');
    if (pollId && filteredPolls.length > 0) {
      const pollIndex = filteredPolls.findIndex(poll => poll.id === pollId);
      if (pollIndex !== -1) {
        setCurrentPollIndex(pollIndex);
      }
    }
  }, [searchParams, filteredPolls]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
        <Navbar />
        <LoadingSpinner message="Loading polls..." />
        <Footer />
      </div>
    );
  }

  if (filteredPolls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
        <Navbar />
        <EmptyPollsState />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col justify-center items-center relative pb-8 lg:pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 relative">
          <PollNavigation 
            currentIndex={currentPollIndex} 
            totalPolls={filteredPolls.length} 
            onPrevious={prevPoll} 
            onNext={nextPoll}
          />

          <div className="w-full">
            <SwipeablePollContainer 
              polls={filteredPolls}
              currentIndex={currentPollIndex}
              onVote={handleVote}
              onNext={nextPoll}
              onPrevious={prevPoll}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;