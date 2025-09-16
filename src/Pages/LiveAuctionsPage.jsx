import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Clock, Users, DollarSign, Eye, MoreVertical, Play, Pause, RefreshCw, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Search, X, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatTimeRemaining } from '../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLiveAuctions, 
  acceptBid, 
  rejectBid, 
  clearBidOperationStates,
  selectLiveAuctions, 
  selectOffersLoading, 
  selectOffersError, 
  selectHasAuctions,
  selectBidOperationLoading,
  selectBidOperationError,
  selectBidOperationSuccess
} from '../redux/slices/offersSlice';
import { useSearch } from '../context/SearchContext';
import LiveAuctionsSkeleton from '../components/skeletons/LiveAuctionsSkeleton';
import LiveAuctionsSortingSkeleton from '@/components/skeletons/LiveAuctionsSortingSkeleton';
import LoadMore from '../components/ui/load-more';
import useLoadMore from '../hooks/useLoadMore';
import BidConfirmationModal from '../components/ui/BidConfirmationModal';

const LiveAuctionsPage = () => {
  const dispatch = useDispatch();
  const liveAuctionsData = useSelector(selectLiveAuctions);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);
  const hasAuctions = useSelector(selectHasAuctions);
  const bidOperationLoading = useSelector(selectBidOperationLoading);
  const bidOperationError = useSelector(selectBidOperationError);
  const bidOperationSuccess = useSelector(selectBidOperationSuccess);

  // Search context
  const { getSearchResults, searchQuery, clearSearch } = useSearch();

  // Sorting state
  const [sortBy, setSortBy] = useState('time-asc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [sortProgress, setSortProgress] = useState(0);
  const dropdownRef = useRef(null);

  // Load more configuration
  const itemsPerPage = 3;

  // Transform API data to match component structure
  const transformAuctionsData = (auctions) => {
    if (!auctions || !Array.isArray(auctions)) return [];
    
    return auctions.map(auction => {
      // Find the highest active bid (not expired, not accepted, status pending)
      const activeBids = auction.bid?.filter(bid => 
        !bid.is_expired && 
        !bid.is_accepted && 
        bid.status === 'pending'
      ) || [];
      
      const highestBid = activeBids.reduce((max, bid) => 
        parseFloat(bid.amount) > parseFloat(max.amount) ? bid : max, 
        activeBids[0] || { amount: '0' }
      );

      // Calculate time remaining from remaining_seconds
      const timeRemaining = new Date(Date.now() + (auction.remaining_seconds * 1000));

      // Check if auction has any accepted bids
      const hasAcceptedBid = auction.bid?.some(bid => bid.is_accepted) || false;

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
        status: hasAcceptedBid ? 'accepted' : 'live',
        images: auction.image_url ? [auction.image_url] : ['/api/placeholder/400/300'],
        description: auction.title || 'Vehicle description not available',
        cashOffer: parseFloat(auction.cash_offer || '0'),
        cashOfferExpires: auction.cash_offer_expires_in || '',
        auctionEndsAt: auction.auction_ends_at || '',
        inWorkingHours: auction.in_working_hours || false,
        isSentToSalesforce: auction.is_sent_to_salesforce || '',
        bids: auction.bid || [],
        highestBidData: highestBid,
        hasAcceptedBid: hasAcceptedBid
      };
    });
  };

  // Get search results for live auctions
  const searchResults = getSearchResults('liveAuctions');
  const allAuctions = transformAuctionsData(searchResults);
  
  // Filter out auctions with accepted bids - only show live auctions
  const auctions = allAuctions.filter(auction => !auction.hasAcceptedBid);

  useEffect(() => {
    dispatch(fetchLiveAuctions());
  }, [dispatch]);

  // Handle bid operation success
  useEffect(() => {
    if (bidOperationSuccess) {
      // Refresh live auctions to get updated data
      dispatch(fetchLiveAuctions());
      
      // Auto-close modal after a short delay to show success message
      const timer = setTimeout(() => {
        setIsConfirmationModalOpen(false);
        setIsBidsModalOpen(false);
        setConfirmationData(null);
        dispatch(clearBidOperationStates());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [bidOperationSuccess, dispatch]);

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
  const [isBidsModalOpen, setIsBidsModalOpen] = useState(false);
  const [selectedAuctionBids, setSelectedAuctionBids] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

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

  // Use load more hook
  const {
    paginatedItems: paginatedAuctions,
    hasMoreItems,
    remainingItems,
    isLoadingMore,
    handleLoadMore
  } = useLoadMore(sortedAuctions, itemsPerPage);

  // Debug logging
  // console.log('LiveAuctions Debug:', {
  //   auctionsLength: auctions.length,
  //   sortedAuctionsLength: sortedAuctions.length,
  //   paginatedAuctionsLength: paginatedAuctions.length,
  //   hasMoreItems,
  //   remainingItems,
  //   itemsPerPage
  // });

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

  const handleViewAllBids = (auction) => {
    setSelectedAuctionBids(auction);
    setIsBidsModalOpen(true);
  };

  const handleAcceptBid = (bidId) => {
    const bid = selectedAuctionBids?.bids?.find(b => b.id === bidId);
    if (bid) {
      setConfirmationData({ bid, action: 'accept' });
      setIsConfirmationModalOpen(true);
    }
  };

  const handleRejectBid = (bidId) => {
    const bid = selectedAuctionBids?.bids?.find(b => b.id === bidId);
    if (bid) {
      setConfirmationData({ bid, action: 'reject' });
      setIsConfirmationModalOpen(true);
    }
  };

  const handleConfirmBidAction = async () => {
    if (!confirmationData) return;
    
    const { bid, action } = confirmationData;
    const bidData = {
      bidId: bid.id,
      productId: selectedAuctionBids?.id,
      bidderId: bid.bidder_id
    };
    
    try {
      if (action === 'accept') {
        await dispatch(acceptBid(bidData)).unwrap();
      } else if (action === 'reject') {
        await dispatch(rejectBid(bidData)).unwrap();
      }
      
      // Close modals and reset state on success
      setIsConfirmationModalOpen(false);
      setIsBidsModalOpen(false);
      setConfirmationData(null);
      
    } catch (error) {
      console.error(`Error ${action}ing bid:`, error);
      // Error is handled by Redux state, no need to do anything here
    }
  };

  const handleCloseConfirmationModal = () => {
    if (!bidOperationLoading) {
      setIsConfirmationModalOpen(false);
      setConfirmationData(null);
      // Clear any bid operation states
      dispatch(clearBidOperationStates());
    }
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

        {/* Search Indicator */}
        {searchQuery && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-4"
          >
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-800">
                    Showing {auctions.length} results for "{searchQuery}"
                  </span>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Clear Search
                </button>
              </div>
            </div>
          </motion.div>
        )}

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
                {paginatedAuctions.map((auction) => (
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    auction.status === 'accepted' 
                      ? 'bg-success text-white' 
                      : 'bg-success text-white'
                  }`}>
                    {auction.status === 'accepted' ? 'ACCEPTED' : 'LIVE'}
                  </span>
                </div>
                {/* Increase Amount Badge */}
                {auction.currentBid > auction.cashOffer && auction.cashOffer > 0 && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-success text-white px-2 py-1 rounded-full text-md font-semibold flex items-center space-x-1">
                      <ArrowUp className="w-3 h-3" />
                      <span>+{formatCurrency(auction.currentBid - auction.cashOffer)}</span>
                    </div>
                  </div>
                )}
                {/* <div className="absolute top-4 right-4 dropdown-container">
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
                </div> */}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Vehicle Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-neutral-800 mb-2">{auction.vehicle}</h3>
                  <p className="text-neutral-600 text-sm mb-1">{auction.description}</p>
                  <p className="text-neutral-500 text-xs">VIN: {auction.vin}</p>
                </div>

                {/* Bids and Offers Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Highest Bid Badge */}
                  {auction.bidCount > 0 && (
                    <div className="inline-flex items-center gap-2 bg-success/10 text-success px-3 py-2 rounded-full border border-success/20">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {formatCurrency(auction.currentBid)}
                      </span>
                      <span className="text-xs bg-success/20 px-2 py-0.5 rounded-full">
                        {auction.bidCount} active
                      </span>
                    </div>
                  )}

                  {/* Cash Offer Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${
                    auction.cashOffer > 0 
                      ? 'bg-primary/10 text-primary-600 border-primary/20' 
                      : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {auction.cashOffer > 0 ? formatCurrency(auction.cashOffer) : 'No cash offer'}
                    </span>
                    {auction.cashOffer > 0 && (
                      <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                        Instant
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <span className="text-sm font-semibold text-warning">
                      {formatTimeRemaining(auction.timeRemaining)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Time remaining</p>
                  </div>
                </div>


                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEndAuction(auction.id)}
                    className="cursor-pointer flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>View details</span>
                  </button>
                  {auction.bidCount > 0 ? (
                    <button
                      onClick={() => handleViewAllBids(auction)}
                      className="cursor-pointer flex-1 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Active Bids ({auction.bidCount})</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2.5 px-4 text-sm font-medium text-neutral-500 bg-neutral-50 rounded-xl flex items-center justify-center space-x-2 border border-neutral-200">
                      <DollarSign className="w-4 h-4" />
                      <span>No active bids</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* Load More Component */}
        {!loading && !error && sortedAuctions.length > 0 && (
          <LoadMore
            items={sortedAuctions}
            itemsPerPage={itemsPerPage}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            hasMoreItems={hasMoreItems}
            remainingItems={remainingItems}
            SkeletonComponent={LiveAuctionsSortingSkeleton}
            buttonText="Load More Auctions"
            loadingText="Loading auctions..."
            showRemainingCount={true}
          />
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

      {/* Bids Modal */}
      <AnimatePresence>
        {isBidsModalOpen && selectedAuctionBids && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsBidsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Bids for {selectedAuctionBids.vehicle}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    VIN: {selectedAuctionBids.vin} • {selectedAuctionBids.bids?.filter(bid => !bid.is_expired).length || 0} active bids
                  </p>
                </div>
                <button
                  onClick={() => setIsBidsModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedAuctionBids.bids && selectedAuctionBids.bids.length > 0 ? (
                  <div className="space-y-4">
                    {[...selectedAuctionBids.bids]
                      .filter(bid => !bid.is_expired) // Filter out rejected/expired bids
                      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                      .map((bid, index) => (
                      <motion.div
                        key={bid.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-neutral-50 rounded-xl p-4 border ${
                          index === 0 ? 'border-success/30 bg-success/5' : 'border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-success/20 text-success' : 'bg-primary-100 text-primary-600'
                            }`}>
                              <span className="font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-neutral-800">
                                {bid.bidder_display_name || 'Unknown Bidder'}
                              </h3>
                              <p className="text-sm text-neutral-600">
                                {bid.bidder_email || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              index === 0 ? 'text-success' : 'text-primary-600'
                            }`}>
                              {formatCurrency(parseFloat(bid.amount))}
                            </div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              bid.is_accepted 
                                ? 'bg-success/10 text-success'
                                : bid.is_expired
                                ? 'bg-warning/10 text-warning'
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {bid.is_accepted ? 'Accepted' : 
                               bid.is_expired ? 'Expired' : 'Active'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500">Bidder ID:</span>
                            <p className="font-medium text-neutral-800">#{bid.bidder_id || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-neutral-500">Bid Date:</span>
                            <p className="font-medium text-neutral-800">
                              {bid.created_at_raw ? new Date(bid.created_at_raw).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Accept/Reject Bid Buttons - Only for active bids */}
                        {!bid.is_accepted && !bid.is_expired && (
                          <div className="mt-4 pt-4 border-t border-neutral-200">
                            <div className="flex space-x-4 ">
                            <button
                                onClick={() => handleRejectBid(bid.id)}
                                className="flex-1 bg-white text-red-500 border-red-500   px-4 py-2 rounded-xl cursor-pointer  font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject Bid</span>
                              </button>
                              <button
                                onClick={() => handleAcceptBid(bid.id)}
                                className="flex-1 btn-primary flex items-center justify-center space-x-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept Bid</span>
                              </button>
                             
                            </div>
                          </div>
                        )}
                        
                        {bid.notes && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-neutral-200">
                            <span className="text-neutral-500 text-sm">Notes:</span>
                            <p className="text-neutral-800 text-sm mt-1">{bid.notes}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Active Bids Available</h3>
                    <p className="text-neutral-500">This auction doesn't have any active bids.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
                <button
                  onClick={() => setIsBidsModalOpen(false)}
                  className="cursor-pointer btn-ghost"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bid Confirmation Modal */}
      <BidConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleConfirmBidAction}
        action={confirmationData?.action}
        bidData={confirmationData?.bid}
        isLoading={bidOperationLoading}
        error={bidOperationError}
        success={bidOperationSuccess}
      />
    </div>
  );
};

export default LiveAuctionsPage;