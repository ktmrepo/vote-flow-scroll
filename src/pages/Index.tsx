
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import UserDashboard from '@/components/UserDashboard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import PollNavigation from '@/components/PollNavigation';
import SwipeablePollContainer from '@/components/SwipeablePollContainer';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyPollsState from '@/components/EmptyPollsState';
import { seedVoteData } from '@/utils/seedVoteData';

const Index = () => {
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [searchParams] = useSearchParams();
  const { polls, loading } = usePolls();
  const { user } = useAuth();

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

  useEffect(() => {
    if (polls.length > 0) {
      seedVoteData().then((votesAdded) => {
        if (votesAdded > 0) {
          console.log(`Added ${votesAdded} simulated votes to demonstrate engagement`);
        }
      });
    }
  }, [polls.length]);

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
      
      <div className="flex flex-1">
        {user && (
          <>
            {showUserPanel && (
              <div 
                className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
                onClick={() => setShowUserPanel(false)} 
              />
            )}
            
            <div className={`
              fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none
              ${showUserPanel ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <UserDashboard />
            </div>
          </>
        )}

        <div className="flex-1 relative flex flex-col">
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
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
