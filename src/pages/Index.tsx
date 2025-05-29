
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import UserDashboard from '@/components/UserDashboard';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import PollNavigation from '@/components/PollNavigation';
import PollContainer from '@/components/PollContainer';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyPollsState from '@/components/EmptyPollsState';
import { seedVoteData } from '@/utils/seedVoteData';

const Index = () => {
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [searchParams] = useSearchParams();
  const { polls, loading } = usePolls();
  const { user } = useAuth();

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

  // Seed vote data when polls are loaded
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
        <LoadingSpinner message="Loading polls..." />
      </div>
    );
  }

  if (filteredPolls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
        <EmptyPollsState />
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

          {/* Navigation arrows positioned beside poll box */}
          <PollNavigation 
            currentIndex={currentPollIndex} 
            totalPolls={filteredPolls.length} 
            onPrevious={prevPoll} 
            onNext={nextPoll}
          />

          {/* Poll Container */}
          <PollContainer 
            polls={filteredPolls}
            currentIndex={currentPollIndex}
            onVote={handleVote}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
