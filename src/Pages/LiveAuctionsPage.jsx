import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Clock, Users, DollarSign, Eye, MoreVertical, Play, Pause, RefreshCw, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { formatCurrency, formatTimeRemaining } from '../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiveAuctions, selectLiveAuctions, selectOffersLoading, selectOffersError, selectHasAuctions } from '../redux/slices/offersSlice';
import LiveAuctionsSkeleton from '../components/skeletons/LiveAuctionsSkeleton';
import OffersListSkeleton from '../components/skeletons/OffersListSkeleton';
import LiveAuctionsSortingSkeleton from '@/components/skeletons/LiveAuctionsSortingSkeleton';

const LiveAuctionsPage = () => {
  const dispatch = useDispatch();
  const liveAuctionsData = useSelector(selectLiveAuctions);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);
  const hasAuctions = useSelector(selectHasAuctions);

  // Sorting state
  const [sortBy, setSortBy] = useState('time-asc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [sortProgress, setSortProgress] = useState(0);
  const dropdownRef = useRef(null);

  // Transform API data to match component structure
  const transformAuctionsData = (auctions) => {
    if (!auctions || !Array.isArray(auctions)) return [];
    
    return auctions.map(auction => {
      // Find the highest active bid
      const activeBids = auction.bid?.filter(bid => !bid.is_expired && bid.status === 'pending') || [];
      const highestBid = activeBids.reduce((max, bid) => 
        parseFloat(bid.amount) > parseFloat(max.amount) ? bid : max, 
        activeBids[0] || { amount: '0' }
      );

      // Calculate time remaining from remaining_seconds
      const timeRemaining = new Date(Date.now() + (auction.remaining_seconds * 1000));

      return {
        id: auction.product_id?.toString() || 'unknown',
        vehicle: `${auction.year || 'N/A'} ${auction.make || 'Unknown'} ${auction.model || 'Vehicle'}`,
        year: parseInt(auction.year) || 0,
        make: auction.make || 'Unknown',
        model: auction.model || 'Unknown',
        trim: auction.trim || 'N/A',
        vin: auction.vin || 'N/A',
        mileage: 'N/A', // Not provided in API
        currentBid: parseFloat(highestBid?.amount || auction.cash_offer || '0'),
        timeRemaining: timeRemaining,
        bidCount: activeBids.length,
        totalBids: auction.bid?.length || 0,
        highestBidder: highestBid?.bidder_display_name || 'No Active Bids',
        status: 'live',
        images: auction.image_url ? [auction.image_url] : ['/api/placeholder/400/300'],
        description: auction.title || 'Vehicle description not available',
        cashOffer: parseFloat(auction.cash_offer || '0'),
        cashOfferExpires: auction.cash_offer_expires_in || '',
        auctionEndsAt: auction.auction_ends_at || '',
        inWorkingHours: auction.in_working_hours || false,
        isSentToSalesforce: auction.is_sent_to_salesforce || '',
        bids: auction.bid || [],
        highestBidData: highestBid
      };
    });
  };

  const auctions = transformAuctionsData(liveAuctionsData);

  useEffect(() => {
    dispatch(fetchLiveAuctions());
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  // Sort options
  const sortOptions = [
    { value: 'time-asc', label: 'Ending Soon', icon: Clock, description: 'Shortest time remaining' },
    { value: 'time-desc', label: 'Ending Later', icon: Clock, description: 'Longest time remaining' },
    { value: 'amount-desc', label: 'Highest Bid', icon: ArrowDown, description: 'Highest to lowest' },
    { value: 'amount-asc', label: 'Lowest Bid', icon: ArrowUp, description: 'Lowest to highest' },
    { value: 'bids-desc', label: 'Most Bids', icon: Users, description: 'Most active auctions' },
    { value: 'bids-asc', label: 'Least Bids', icon: Users, description: 'Least active auctions' },
  ];

  // Get current selected option
  const selectedOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0];

  // Handle sort selection with loading animation
  const handleSortSelect = (value) => {
    if (value === sortBy) {
      setIsDropdownOpen(false);
      return;
    }
    
    setIsSorting(true);
    setSortProgress(0);
    setIsDropdownOpen(false);
    
    // Simulate sorting process with random delay and progress
    const randomDelay = Math.random() * 1000 + 500; // 500-1500ms
    const progressInterval = 50; // Update progress every 50ms
    
    const progressTimer = setInterval(() => {
      setSortProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, progressInterval);
    
    setTimeout(() => {
      clearInterval(progressTimer);
      setSortProgress(100);
      setSortBy(value);
      
      // Reset after a short delay
      setTimeout(() => {
        setIsSorting(false);
        setSortProgress(0);
      }, 200);
    }, randomDelay);
  };

  // Sort auctions based on selected options
  const sortedAuctions = useMemo(() => {
    if (!auctions || auctions.length === 0) return [];

    // Sort the auctions
    return [...auctions].sort((a, b) => {
      switch (sortBy) {
        case 'time-asc':
          return a.timeRemaining - b.timeRemaining;
        case 'time-desc':
          return b.timeRemaining - a.timeRemaining;
        case 'amount-desc':
          return b.currentBid - a.currentBid;
        case 'amount-asc':
          return a.currentBid - b.currentBid;
        case 'bids-desc':
          return b.bidCount - a.bidCount;
        case 'bids-asc':
          return a.bidCount - b.bidCount;
        default:
          return 0;
      }
    });
  }, [auctions, sortBy]);

  const handleEndAuction = (auctionId) => {
    setAuctions((prev) =>
      prev.map((auction) =>
        auction.id === auctionId ? { ...auction, status: 'ended' } : auction
      )
    );
    setIsActionDropdownOpen(false);
  };

  const handlePauseAuction = (auctionId) => {
    setAuctions((prev) =>
      prev.map((auction) =>
        auction.id === auctionId ? { ...auction, status: 'paused' } : auction
      )
    );
    setIsActionDropdownOpen(false);
  };

  const handleViewDetails = (auctionId) => {
    setSelectedAuction(auctionId);
    setIsActionDropdownOpen(false);
  };

  const toggleDropdown = (auctionId) => {
    setSelectedAuction(auctionId);
    setIsActionDropdownOpen(prev => prev && selectedAuction === auctionId ? false : true);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setIsActionDropdownOpen(false);
    }
  };

  // Loading state
  if (loading) {
    return <LiveAuctionsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero p-8">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Error Loading Auctions</h3>
              <p className="text-neutral-600 mb-4">{error}</p>
              <button 
                onClick={() => dispatch(fetchLiveAuctions())}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-hero p-8">
      <div className="max-w-8xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 variants={itemVariants} className="text-3xl font-bold text-neutral-800 mb-2">
                Live Auctions
              </motion.h1>
              <motion.p variants={itemVariants} className="text-neutral-600">
                Monitor your active auctions and manage bidding in real-time.
              </motion.p>
            </div>
            <motion.button
              variants={itemVariants}
              onClick={() => dispatch(fetchLiveAuctions())}
              disabled={loading}
              className="cursor-pointer btn-ghost flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">{auctions.length}</div>
            <div className="text-sm text-neutral-600">Active Auctions</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {formatCurrency(auctions.reduce((sum, auction) => sum + auction.currentBid, 0))}
            </div>
            <div className="text-sm text-neutral-600">Total Current Bids</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6 text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {auctions.reduce((sum, auction) => sum + auction.bidCount, 0)}
            </div>
            <div className="text-sm text-neutral-600">Total Bids</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {auctions.length > 0 ? Math.min(...auctions.map(a => Math.floor((a.timeRemaining - new Date()) / (1000 * 60 * 60)))) : 0}h
            </div>
            <div className="text-sm text-neutral-600">Shortest Time Left</div>
          </motion.div>
        </motion.div>

        {/* Sorting Section */}
        {!loading && !error && auctions.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-1">Live Auctions</h2>
                <p className="text-sm text-neutral-600">{auctions.length} active auctions</p>
              </div>
              
              {/* Modern Sort Dropdown */}
              <motion.div
                variants={containerVariants}
                className="relative w-[200px]"
                ref={dropdownRef}
              >
                {/* Dropdown Trigger */}
                <button
                  onClick={() => !isSorting && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isSorting}
                  className={`cursor-pointer flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent group ${
                    isSorting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSorting ? (
                      <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-neutral-500 group-hover:text-orange-500 transition-colors" />
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium text-neutral-700">
                        {isSorting ? 'Sorting...' : selectedOption.label}
                      </div>
                    </div>
                  </div>
                  {!isSorting && (
                    <ChevronDown 
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      {sortOptions.map((option, index) => {
                        const IconComponent = option.icon;
                        const isSelected = option.value === sortBy;
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSortSelect(option.value)}
                            className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors duration-150 ${
                              isSelected ? 'bg-orange-50 text-orange-700' : 'text-neutral-700'
                            } ${index !== sortOptions.length - 1 ? 'border-b border-neutral-100' : ''}`}
                          >
                            <div className={`p-1.5 rounded-lg ${
                              isSelected ? 'bg-orange-100' : 'bg-neutral-100'
                            }`}>
                              <IconComponent className={`w-3.5 h-3.5 ${
                                isSelected ? 'text-orange-600' : 'text-neutral-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${
                                isSelected ? 'text-orange-700' : 'text-neutral-700'
                              }`}>
                                {option.label}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Auctions Grid or Sorting Loading */}
        {!loading && !error && sortedAuctions.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {/* Sorting Loading State - Show skeleton for auctions grid */}
            {isSorting && (
              // <motion.div
              //   initial={{ opacity: 0, y: 20 }}
              //   animate={{ opacity: 1, y: 0 }}
              //   exit={{ opacity: 0, y: 20 }}
              //   transition={{ duration: 0.3, ease: "easeOut" }}
              //   className="col-span-full"
              // >
              //   <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              //     {Array.from({ length: 3 }).map((_, index) => (
              //       <div key={index} className="card overflow-hidden animate-pulse">
              //         <div className="h-48 bg-neutral-200"></div>
              //         <div className="p-6">
              //           <div className="h-6 bg-neutral-200 rounded-md w-3/4 mb-2"></div>
              //           <div className="h-4 bg-neutral-200 rounded-md w-full mb-2"></div>
              //           <div className="h-3 bg-neutral-200 rounded-md w-1/2 mb-4"></div>
              //           <div className="h-16 bg-neutral-200 rounded-lg mb-4"></div>
              //           <div className="h-4 bg-neutral-200 rounded-md w-1/3 mb-4"></div>
              //           <div className="flex space-x-4">
              //             <div className="h-10 bg-neutral-200 rounded-lg flex-1"></div>
              //             <div className="h-10 bg-neutral-200 rounded-lg flex-1"></div>
              //           </div>
              //         </div>
              //       </div>
              //     ))}
              //   </div>
              // </motion.div>
              <LiveAuctionsSortingSkeleton />
            )}

            {/* Auctions Grid - Hidden during sorting */}
            {!isSorting && (
              <>
                {sortedAuctions.map((auction) => (
            <motion.div
              key={auction.id}
              variants={itemVariants}
              className="card overflow-hidden hover:shadow-medium relative"
            >
              {/* Image */}
              <div className="relative h-48 bg-neutral-200 overflow-hidden">
                {auction.images[0] && auction.images[0] !== '/api/placeholder/400/300' ? (
                  <img 
                    src={auction.images[0]} 
                    alt={auction.vehicle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-16 h-16 text-neutral-400" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-success text-white px-2 py-1 rounded-full text-xs font-semibold">
                    LIVE
                  </span>
                </div>
                <div className="absolute top-4 right-4 dropdown-container">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <button 
                      onClick={() => toggleDropdown(auction.id)}
                      className="cursor-pointer p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
                    >
                      <MoreVertical className="w-4 h-4 text-neutral-600" />
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {isActionDropdownOpen && selectedAuction === auction.id && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-20"
                      >
                        <motion.div
                          variants={dropdownItemVariants}
                          className="px-2 py-1"
                        >
                          <button
                            onClick={() => handleViewDetails(auction.id)}
                            className="cursor-pointer w-full text-left px-4 py-2 text-sm text-neutral-800 hover:bg-primary-50 hover:text-primary-600 rounded-md transition-colors duration-150 flex items-center space-x-3"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </motion.div>
                        <motion.div
                          variants={dropdownItemVariants}
                          className="px-2 py-1"
                        >
                          <button
                            onClick={() => handleEndAuction(auction.id)}
                            className="cursor-pointer w-full text-left px-4 py-2 text-sm text-neutral-800 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-150 flex items-center space-x-3"
                          >
                            <Pause className="w-4 h-4" />
                            <span>End Auction</span>
                          </button>
                        </motion.div>
                        <motion.div
                          variants={dropdownItemVariants}
                          className="px-2 py-1"
                        >
                          <button
                            onClick={() => handlePauseAuction(auction.id)}
                            className="cursor-pointer w-full text-left px-4 py-2 text-sm text-neutral-800 hover:bg-yellow-50 hover:text-yellow-600 rounded-md transition-colors duration-150 flex items-center space-x-3"
                          >
                            <Play className="w-4 h-4" />
                            <span>Pause Auction</span>
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-2">{auction.vehicle}</h3>
                <p className="text-neutral-600 text-sm mb-2">{auction.description}</p>
                <p className="text-neutral-500 text-xs mb-4">VIN: {auction.vin}</p>

                {/* Current Bid */}
                <div className="bg-success/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">
                        {auction.bidCount > 0 ? 'Current Bid' : 'Cash Offer'}
                      </p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(auction.currentBid)}</p>
                      {auction.cashOffer > 0 && auction.bidCount === 0 && (
                        <p className="text-xs text-neutral-500">{auction.cashOfferExpires}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">
                        {auction.bidCount} active bids
                        {auction.totalBids > auction.bidCount && (
                          <span className="text-neutral-400"> ({auction.totalBids - auction.bidCount} expired)</span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500">by {auction.highestBidder}</p>
                    </div>
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">
                      {formatTimeRemaining(auction.timeRemaining)}
                    </span>
                  </div>
                  <button className="cursor-pointer p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEndAuction(auction.id)}
                    className="cursor-pointer flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Pause className="w-4 h-4" />
                    <span>End Auction</span>
                  </button>
                  <button className="btn-primary flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Pause Auction</span>
                  </button>
                </div>
              </div>
            </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && (!hasAuctions || auctions.length === 0) && (
          <motion.div
            variants={itemVariants}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Active Auctions</h3>
            <p className="text-neutral-600 mb-6">Start a new auction to get the best offers for your vehicle.</p>
            <button className="btn-primary">
              Start New Auction
            </button>
          </motion.div>
        )}
      </div>
      {isActionDropdownOpen && (
        <motion.div
          className="fixed inset-0 z-10"
          onClick={handleClickOutside}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
  );
};

export default LiveAuctionsPage;