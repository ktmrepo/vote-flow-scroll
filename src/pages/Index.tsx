import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyPollsState from '@/components/EmptyPollsState';
import HomePollCard from '@/components/HomePollCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Clock, Star, BarChart3, Users, Vote } from 'lucide-react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { polls, loading } = usePolls();
  const [activeSection, setActiveSection] = useState('latest');

  console.log('Index component - Polls:', polls, 'Loading:', loading);

  // Filter polls based on category from URL params
  const filteredPolls = polls.filter(poll => {
    const category = searchParams.get('category');
    if (category && poll.category !== category) return false;
    return true;
  });

  // Categorize polls
  const latestPolls = filteredPolls
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const popularPolls = filteredPolls
    .filter(poll => {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
      return totalVotes > 10; // Polls with more than 10 votes
    })
    .sort((a, b) => {
      const aVotes = a.options.reduce((sum, option) => sum + option.votes, 0);
      const bVotes = b.options.reduce((sum, option) => sum + option.votes, 0);
      return bVotes - aVotes;
    })
    .slice(0, 6);

  const featuredPolls = filteredPolls
    .filter(poll => poll.category === 'Technology' || poll.category === 'Entertainment')
    .slice(0, 6);

  const unvotedPolls = user 
    ? filteredPolls.filter(poll => !poll.user_has_voted).slice(0, 6)
    : [];

  useEffect(() => {
    setActiveSection('latest');
  }, [searchParams]);

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

  const renderPollGrid = (pollList: typeof polls, emptyMessage: string) => {
    if (pollList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pollList.map((poll) => (
          <div key={poll.id} className="transform transition-all duration-300 hover:scale-105">
            <HomePollCard poll={poll} />
          </div>
        ))}
      </div>
    );
  };

  const getSectionStats = () => {
    const totalVotes = filteredPolls.reduce((sum, poll) => 
      sum + poll.options.reduce((optSum, option) => optSum + option.votes, 0), 0
    );
    
    return {
      totalPolls: filteredPolls.length,
      totalVotes,
      activeUsers: Math.floor(totalVotes / 3), // Rough estimate
    };
  };

  const stats = getSectionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover What Others Think
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Engage with interactive polls and share your voice on topics that matter
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                onClick={() => document.getElementById('polls-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Vote className="w-5 h-5 mr-2" />
                Start Voting
              </Button>
              {user && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  onClick={() => window.location.href = '/submit'}
                >
                  Create Poll
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <BarChart3 className="w-12 h-12 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalPolls}</div>
                <div className="text-gray-600">Active Polls</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalVotes.toLocaleString()}</div>
                <div className="text-gray-600">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
                <div className="text-gray-600">Active Participants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Polls Section */}
        <div id="polls-section" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Explore Polls
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover trending topics, share your opinions, and see what the community thinks
              </p>
            </div>

            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
                <TabsTrigger value="latest" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Latest
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="featured" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Featured
                </TabsTrigger>
                {user && (
                  <TabsTrigger value="for-you" className="flex items-center gap-2">
                    <Vote className="w-4 h-4" />
                    For You
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="latest" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Latest Polls
                    </CardTitle>
                    <CardDescription>
                      Fresh polls from the community - be among the first to vote!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderPollGrid(latestPolls, "No recent polls available")}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="popular" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Popular Polls
                    </CardTitle>
                    <CardDescription>
                      Polls with the highest engagement from our community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderPollGrid(popularPolls, "No popular polls available yet")}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="featured" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Featured Polls
                    </CardTitle>
                    <CardDescription>
                      Curated polls on trending topics in technology and entertainment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderPollGrid(featuredPolls, "No featured polls available")}
                  </CardContent>
                </Card>
              </TabsContent>

              {user && (
                <TabsContent value="for-you" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Vote className="w-5 h-5 text-purple-600" />
                        For You
                      </CardTitle>
                      <CardDescription>
                        Polls you haven't voted on yet - make your voice heard!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderPollGrid(unvotedPolls, "You've voted on all available polls! Check back later for new ones.")}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>

            {/* Call to Action */}
            {!user && (
              <div className="mt-16 text-center">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Join the Community
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Sign up to vote on polls, create your own, and engage with a vibrant community of opinion sharers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Sign Up Free
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Sign In
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;