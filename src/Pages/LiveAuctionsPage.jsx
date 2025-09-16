import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Clock, Users, DollarSign, Eye, MoreVertical, Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency, formatTimeRemaining } from '../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiveAuctions, selectLiveAuctions, selectOffersLoading, selectOffersError, selectHasAuctions } from '../redux/slices/offersSlice';
import LiveAuctionsSkeleton from '../components/skeletons/LiveAuctionsSkeleton';

const LiveAuctionsPage = () => {
  const dispatch = useDispatch();
  const liveAuctionsData = useSelector(selectLiveAuctions);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);
  const hasAuctions = useSelector(selectHasAuctions);

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

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleEndAuction = (auctionId) => {
    setAuctions((prev) =>
      prev.map((auction) =>
        auction.id === auctionId ? { ...auction, status: 'ended' } : auction
      )
    );
    setIsDropdownOpen(false);
  };

  const handlePauseAuction = (auctionId) => {
    setAuctions((prev) =>
      prev.map((auction) =>
        auction.id === auctionId ? { ...auction, status: 'paused' } : auction
      )
    );
    setIsDropdownOpen(false);
  };

  const handleViewDetails = (auctionId) => {
    setSelectedAuction(auctionId);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = (auctionId) => {
    setSelectedAuction(auctionId);
    setIsDropdownOpen(prev => prev && selectedAuction === auctionId ? false : true);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setIsDropdownOpen(false);
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

        {/* Auctions Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {auctions.map((auction) => (
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
                    {isDropdownOpen && selectedAuction === auction.id && (
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
        </motion.div>

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
      {isDropdownOpen && (
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