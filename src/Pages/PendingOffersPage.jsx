import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Clock, DollarSign, Users, CheckCircle, X, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate, formatTimeRemaining } from '../lib/utils';
import { fetchPendingOffers, selectPendingOffers, selectOffersLoading, selectOffersError } from '../redux/slices/offersSlice';
import PendingOffersSkeleton from '../components/skeletons/PendingOffersSkeleton';

const PendingOffersPage = () => {
  const dispatch = useDispatch();
  const pendingOffersData = useSelector(selectPendingOffers);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);

  // Transform API data to match component structure
  const transformOffersData = (offers) => {
    if (!offers || !Array.isArray(offers)) return [];
    
    return offers.map(offer => {
      // Find the highest bid from active bids only
      const activeBids = offer.bid?.filter(bid => !bid.is_expired && bid.status === 'pending') || [];
      const highestBid = activeBids.reduce((max, bid) => 
        parseFloat(bid.amount) > parseFloat(max.amount) ? bid : max, 
        activeBids[0] || { amount: '0' }
      );

      // Check if any bid is urgent (expires soon)
      const now = new Date();
      const urgentBid = activeBids.find(bid => {
        const endTime = new Date(bid.end_timestamp);
        const timeDiff = endTime - now;
        return timeDiff > 0 && timeDiff < 2 * 60 * 60 * 1000; // Less than 2 hours
      });

      // Parse auction end time safely
      let auctionEndTime;
      try {
        auctionEndTime = new Date(offer.auction_ends_at);
        if (isNaN(auctionEndTime.getTime())) {
          auctionEndTime = new Date();
        }
      } catch (e) {
        auctionEndTime = new Date();
      }

      return {
        id: offer.product_id?.toString() || 'unknown',
        vehicle: `${offer.year || 'N/A'} ${offer.make || 'Unknown'} ${offer.model || 'Vehicle'}`,
        year: parseInt(offer.year) || 0,
        make: offer.make || 'Unknown',
        model: offer.model || 'Unknown',
        trim: offer.trim || 'N/A',
        vin: offer.vin || 'N/A',
        mileage: 'N/A', // Not provided in API
        highestBid: parseFloat(highestBid?.amount || '0'),
        bidCount: activeBids.length,
        timeRemaining: auctionEndTime,
        status: urgentBid ? 'urgent' : 'pending',
        dealer: highestBid?.bidder_display_name || 'No Active Bids',
        dealerRating: 4.5, // Not provided in API, using default
        dealerBidCount: activeBids.filter(bid => bid.bidder_id === highestBid?.bidder_id).length,
        images: offer.image_url ? [offer.image_url] : ['/api/placeholder/400/300'],
        description: offer.title || 'Vehicle description not available',
        auctionEndTime: auctionEndTime,
        cashOffer: parseFloat(offer.cash_offer || '0'),
        auctionStatus: offer.auction_status || 'unknown',
        bids: offer.bid || [],
        highestBidData: highestBid,
        totalBids: offer.bid?.length || 0
      };
    });
  };

  const pendingOffers = transformOffersData(pendingOffersData);

  // Modal state
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isBidsModalOpen, setIsBidsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPendingOffers());
  }, [dispatch]);

  const handleAcceptOffer = (offerId) => {
    // TODO: Implement API call to accept offer
    console.log('Accepting offer:', offerId);
    // For now, just dispatch the action to move to accepted offers
    // dispatch(acceptOffer(offerId));
  };

  const handleRejectOffer = (offerId) => {
    // TODO: Implement API call to reject offer
    console.log('Rejecting offer:', offerId);
    // For now, just dispatch the action to remove from pending offers
    // dispatch(removePendingOffer(offerId));
  };

  // Handle show bids modal
  const handleShowBids = (offer) => {
    setSelectedOffer(offer);
    setIsBidsModalOpen(true);
  };

  // Close bids modal
  const handleCloseBidsModal = () => {
    setIsBidsModalOpen(false);
    setSelectedOffer(null);
  };

  // Handle accept bid
  const handleAcceptBid = (bidId) => {
    // TODO: Implement API call to accept specific bid
    console.log('Accepting bid:', bidId);
    // Close modal after accepting
    handleCloseBidsModal();
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Loading state
  if (loading) {
    return <PendingOffersSkeleton />;
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
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Error Loading Offers</h3>
              <p className="text-neutral-600 mb-4">{error}</p>
              <button 
                onClick={() => dispatch(fetchPendingOffers())}
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
    <div className="min-h-screen bg-gradient-hero p-8 ">
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
                Pending Offers
              </motion.h1>
              <motion.p variants={itemVariants} className="text-neutral-600">
                Review and respond to offers from dealers on your vehicles.
              </motion.p>
            </div>
            <motion.button
              variants={itemVariants}
              onClick={() => dispatch(fetchPendingOffers())}
              disabled={loading}
              className="btn-ghost flex items-center space-x-2"
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
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">{pendingOffers.length}</div>
            <div className="text-sm text-neutral-600">Pending Offers</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {pendingOffers.length > 0 ? formatCurrency(Math.max(...pendingOffers.map(o => Math.max(o.highestBid, o.cashOffer)))) : '$0'}
            </div>
            <div className="text-sm text-neutral-600">Highest Offer</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {pendingOffers.reduce((sum, offer) => sum + offer.totalBids, 0)}
            </div>
            <div className="text-sm text-neutral-600">Total Bids</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6 text-center">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {pendingOffers.filter(o => o.status === 'urgent').length}
            </div>
            <div className="text-sm text-neutral-600">Urgent Offers</div>
          </motion.div>
        </motion.div>

        {/* Pending Offers List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {pendingOffers.map((offer) => (
            <motion.div
              key={offer.id}
              variants={itemVariants}
              className={`card p-6 border-l-4 ${
                offer.status === 'urgent' ? 'border-error' : 'border-warning'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                    <Car className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800">{offer.vehicle}</h3>
                    <p className="text-sm text-neutral-600">{offer.mileage} miles • {offer.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-neutral-500">
                        {formatDate(offer.auctionEndTime)} • {offer.bidCount} active bids
                      </span>
                      {offer.cashOffer > 0 && (
                        <span className="text-sm text-success font-medium">
                          Cash Offer: {formatCurrency(offer.cashOffer)}
                        </span>
                      )}
                      {offer.totalBids > offer.bidCount && (
                        <span className="text-sm text-neutral-400">
                          ({offer.totalBids - offer.bidCount} expired)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-success mb-1">
                    {offer.highestBid > 0 ? formatCurrency(offer.highestBid) : formatCurrency(offer.cashOffer)}
                  </div>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(offer.status)}`}>
                    {getStatusIcon(offer.status)}
                    <span className="capitalize">{offer.status}</span>
                  </div>
                  {offer.highestBid === 0 && offer.cashOffer > 0 && (
                    <div className="text-xs text-neutral-500 mt-1">Cash Offer</div>
                  )}
                </div>
              </div>

              {/* Dealer Information */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-neutral-800 mb-2">
                  {offer.bidCount > 0 ? 'Highest Bidder' : 'Offer Information'}
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    {offer.bidCount > 0 ? (
                      <>
                        <p className="font-medium text-neutral-700">{offer.dealer}</p>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <span>Rating: {offer.dealerRating}/5</span>
                          <span>•</span>
                          <span>{offer.dealerBidCount} bids placed</span>
                          {offer.highestBidData?.bidder_email && (
                            <>
                              <span>•</span>
                              <span>{offer.highestBidData.bidder_email}</span>
                            </>
                          )}
                        </div>
                        {offer.highestBidData?.bid_at && (
                          <p className="text-xs text-neutral-500 mt-1">
                            Bid placed: {offer.highestBidData.bid_at.date} at {offer.highestBidData.bid_at.time}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-neutral-700">
                          {offer.cashOffer > 0 ? 'Cash Offer Available' : 'No Active Bids'}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          {offer.cashOffer > 0 && (
                            <>
                              <span>Cash Offer: {formatCurrency(offer.cashOffer)}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>Total Bids: {offer.totalBids}</span>
                          {offer.totalBids > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-warning">All expired</span>
                            </>
                          )}
                        </div>
                        {offer.totalBids > 0 && (
                          <p className="text-xs text-neutral-500 mt-1">
                            Previous highest bid: {formatCurrency(offer.highestBid)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">Auction Status</p>
                    <p className="font-semibold text-warning">
                      {offer.auctionStatus === 'active' ? formatTimeRemaining(offer.timeRemaining) : offer.auctionStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="btn-ghost flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleShowBids(offer)}
                    disabled={offer.totalBids === 0}
                  >
                    View All Bids ({offer.totalBids})
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRejectOffer(offer.id)}
                    disabled={offer.bidCount === 0}
                    className="btn-ghost text-error hover:bg-error/10 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleAcceptOffer(offer.id)}
                    disabled={offer.bidCount === 0}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept Offer</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {pendingOffers.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Pending Offers</h3>
            <p className="text-neutral-600 mb-6">You don't have any pending offers at the moment.</p>
            <button className="btn-primary">
              Start New Auction
            </button>
          </motion.div>
        )}
      </div>

      {/* Bids Modal */}
      <AnimatePresence>
        {isBidsModalOpen && selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseBidsModal}
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
                    Bids for {selectedOffer.vehicle}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    VIN: {selectedOffer.vin} • {selectedOffer.bids?.length || 0} total bids
                  </p>
                </div>
                <button
                  onClick={handleCloseBidsModal}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedOffer.bids && selectedOffer.bids.length > 0 ? (
                  <div className="space-y-4">
                    {[...selectedOffer.bids]
                      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                      .map((bid, index) => (
                      <motion.div
                        key={bid.id}
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
                                {bid.bidder_display_name}
                              </h3>
                              <p className="text-sm text-neutral-600">
                                {bid.bidder_email}
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
                              bid.status === 'rejected' 
                                ? 'bg-error/10 text-error'
                                : bid.is_expired
                                ? 'bg-warning/10 text-warning'
                                : bid.is_accepted
                                ? 'bg-success/10 text-success'
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {bid.is_accepted ? 'Accepted' : 
                               bid.is_expired ? 'Expired' : 
                               bid.status === 'rejected' ? 'Rejected' : 'Pending'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500">Bid Date:</span>
                            <p className="font-medium text-neutral-800">
                              {bid.bid_at.date} at {bid.bid_at.time}
                            </p>
                          </div>
                          {/* <div>
                            <span className="text-neutral-500">Bidder ID:</span>
                            <p className="font-medium text-neutral-800">#{bid.bidder_id}</p>
                          </div> */}
                          {/* Accept Bid Button - Only for highest bid and if not already accepted/expired */}
                        {!bid.is_accepted && !bid.is_expired && (
                          <div className="mt-4 pt-4 border-t border-neutral-200">
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="w-[50%] btn-primary flex relative left-3/4 -translate-x-1/2 space-x-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Accept This Bid</span>
                            </button>
                          </div>
                        )}
                        </div>
                        
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
                    <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Bids Available</h3>
                    <p className="text-neutral-500">This auction doesn't have any bids yet.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
                <button
                  onClick={handleCloseBidsModal}
                  className="btn-ghost"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingOffersPage;
