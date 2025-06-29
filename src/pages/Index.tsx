import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePolls } from '@/hooks/usePolls';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyPollsState from '@/components/EmptyPollsState';
import HomePollCard from '@/components/HomePollCard';
import TrendingPollCard from '@/components/TrendingPollCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Star, BarChart3, Users, Vote, ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { polls, loading } = usePolls();
  const [currentPage, setCurrentPage] = useState(1);
  const [realTimeStats, setRealTimeStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activeParticipants: 0
  });
  const [trendingPolls, setTrendingPolls] = useState([]);
  const pollsPerPage = 15;

  console.log('Index component - Polls:', polls, 'Loading:', loading);

  // Check if we're on a category page
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  const filter = searchParams.get('filter');
  const isCategoryPage = category || sort || filter;

  // Fetch real-time analytics
  useEffect(() => {
    const fetchRealTimeStats = async () => {
      try {
        // Get total polls count
        const { count: pollsCount } = await supabase
          .from('polls')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Get total votes count
        const { count: votesCount } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true });

        // Get total users count (Active Participants = total registered users)
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setRealTimeStats({
          totalPolls: pollsCount || 0,
          totalVotes: votesCount || 0,
          activeParticipants: usersCount || 0
        });
      } catch (error) {
        console.error('Error fetching real-time stats:', error);
        // Fallback to calculated stats from polls data
        const totalVotes = polls.reduce((sum, poll) => 
          sum + poll.options.reduce((optSum, option) => optSum + option.votes, 0), 0
        );
        
        setRealTimeStats({
          totalPolls: polls.filter(poll => poll.is_active).length,
          totalVotes,
          activeParticipants: Math.floor(totalVotes / 3)
        });
      }
    };

    if (polls.length > 0) {
      fetchRealTimeStats();
    }
  }, [polls]);

  // Fetch trending polls (admin-assigned polls for trending section)
  useEffect(() => {
    const fetchTrendingPolls = async () => {
      try {
        // For now, we'll use the most voted polls as trending
        // In the future, admin can assign specific polls to trending
        const { data: voteCounts } = await supabase
          .from('votes')
          .select('poll_id');

        if (voteCounts) {
          // Count votes per poll
          const pollVoteCounts = voteCounts.reduce((acc, vote) => {
            acc[vote.poll_id] = (acc[vote.poll_id] || 0) + 1;
            return acc;
          }, {});

          // Get top 3 most voted polls
          const topPollIds = Object.entries(pollVoteCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([pollId]) => pollId);

          const topPolls = polls.filter(poll => topPollIds.includes(poll.id));
          setTrendingPolls(topPolls);
        }
      } catch (error) {
        console.error('Error fetching trending polls:', error);
        // Fallback to first 3 polls
        setTrendingPolls(polls.slice(0, 3));
      }
    };

    if (polls.length > 0) {
      fetchTrendingPolls();
    }
  }, [polls]);

  // Filter polls based on URL params
  const filteredPolls = polls.filter(poll => {
    if (category && poll.category !== category) return false;
    return true;
  });

  // Sort polls based on URL params
  const sortedPolls = [...filteredPolls].sort((a, b) => {
    if (sort === 'popular') {
      // Get actual vote counts from database
      const aVotes = Object.values(a.votes || {}).reduce((sum, count) => sum + count, 0);
      const bVotes = Object.values(b.votes || {}).reduce((sum, count) => sum + count, 0);
      return bVotes - aVotes;
    }
    if (sort === 'latest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (filter === 'unvoted' && user) {
      return a.user_has_voted ? 1 : -1;
    }
    if (sort === 'all') {
      // Random order for "All Categories"
      return Math.random() - 0.5;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedPolls.length / pollsPerPage);
  const startIndex = (currentPage - 1) * pollsPerPage;
  const endIndex = startIndex + pollsPerPage;
  const currentPolls = sortedPolls.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, sort, filter]);

  // Categorize polls for homepage
  const featuredPolls = filteredPolls
    .filter(poll => poll.category === 'Technology' || poll.category === 'Entertainment')
    .slice(0, 6);

  const popularPolls = filteredPolls
    .map(poll => {
      // Calculate actual votes from database
      const totalVotes = Object.values(poll.votes || {}).reduce((sum, count) => sum + count, 0);
      return { ...poll, totalVotes };
    })
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 6);

  const unvotedPolls = user 
    ? filteredPolls.filter(poll => !poll.user_has_voted).slice(0, 6)
    : [];

  const latestPolls = filteredPolls
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

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

  const handleViewAllClick = (section: string) => {
    switch (section) {
      case 'featured':
        setSearchParams({ category: 'Technology' });
        break;
      case 'popular':
        setSearchParams({ sort: 'popular' });
        break;
      case 'for-you':
        setSearchParams({ filter: 'unvoted' });
        break;
      case 'latest':
        setSearchParams({ sort: 'latest' });
        break;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = () => {
    if (category) return `${category} Polls`;
    if (sort === 'popular') return 'Popular Polls';
    if (sort === 'latest') return 'Latest Polls';
    if (sort === 'all') return 'All Categories';
    if (filter === 'unvoted') return 'For You';
    return 'All Polls';
  };

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
          <div key={poll.id} className="h-full">
            <HomePollCard poll={poll} />
          </div>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant={1 === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map(page => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant={totalPages === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // If this is a category/filter page, show the filtered results
  if (isCategoryPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
        <Navbar />
        
        <div className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => setSearchParams({})}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
              <p className="text-gray-600">
                Showing {currentPolls.length} of {sortedPolls.length} polls
                {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>

            {renderPollGrid(currentPolls, `No polls found in this ${category ? 'category' : 'section'}.`)}
            {renderPagination()}
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Homepage layout
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
                Start Voting
              </Button>
              {user && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  onClick={() => window.location.href = '/submit'}
                >
                  <Plus className="w-5 h-5 mr-2" />
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
                <div className="text-3xl font-bold text-gray-900">{realTimeStats.totalPolls}</div>
                <div className="text-gray-600">Active Polls</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{realTimeStats.totalVotes.toLocaleString()}</div>
                <div className="text-gray-600">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{realTimeStats.activeParticipants}</div>
                <div className="text-gray-600">Active Participants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Polls Section - Vertical Layout */}
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

            <div className="space-y-16">
              {/* Trending Section */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-red-600" />
                          Trending
                        </CardTitle>
                        <CardDescription>
                          Hot topics everyone's talking about right now
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {trendingPolls.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {trendingPolls.map((poll) => (
                          <div key={poll.id} className="h-full">
                            <TrendingPollCard poll={poll} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No trending polls available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Featured Section */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-600" />
                          Featured Polls
                        </CardTitle>
                        <CardDescription>
                          Curated polls on trending topics in technology and entertainment
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderPollGrid(featuredPolls, "No featured polls available")}
                    <div className="flex justify-end mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewAllClick('featured')}
                        className="flex items-center gap-2"
                      >
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Section */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Popular Polls
                        </CardTitle>
                        <CardDescription>
                          Polls with the highest number of votes from our community
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderPollGrid(popularPolls, "No popular polls available yet")}
                    <div className="flex justify-end mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewAllClick('popular')}
                        className="flex items-center gap-2"
                      >
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* For You Section - Only show if user is logged in */}
              {user && (
                <div>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Vote className="w-5 h-5 text-purple-600" />
                            For You
                          </CardTitle>
                          <CardDescription>
                            Polls you haven't voted on yet - make your voice heard!
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {renderPollGrid(unvotedPolls, "You've voted on all available polls! Check back later for new ones.")}
                      <div className="flex justify-end mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewAllClick('for-you')}
                          className="flex items-center gap-2"
                        >
                          View All
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Latest Section */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Latest Polls
                        </CardTitle>
                        <CardDescription>
                          Fresh polls from the community - be among the first to vote!
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderPollGrid(latestPolls, "No recent polls available")}
                    <div className="flex justify-end mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewAllClick('latest')}
                        className="flex items-center gap-2"
                      >
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

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