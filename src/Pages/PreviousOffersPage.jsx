import { motion, AnimatePresence } from 'framer-motion';
import { Car, DollarSign, Clock, RefreshCw, Eye, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useMemo, useRef } from 'react';
import { 
  fetchPreviousOffers, 
  selectPreviousOffers, 
  selectOffersLoading, 
  selectOffersError,
  selectTotalCount,
  selectHasOffers
} from '../redux/slices/offersSlice';
import PreviousOffersSkeleton from '../components/Skeletons/PreviousOffersSkeleton';
import OffersListSkeleton from '../components/skeletons/OffersListSkeleton';

const PreviousOffersPage = () => {
  const dispatch = useDispatch();
  const offers = useSelector(selectPreviousOffers);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);
  const totalCount = useSelector(selectTotalCount);
  const hasOffers = useSelector(selectHasOffers);

  // Sorting state
  const [sortBy, setSortBy] = useState('date-desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [sortProgress, setSortProgress] = useState(0);
  const dropdownRef = useRef(null);

  
  // Modal state
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isBidsModalOpen, setIsBidsModalOpen] = useState(false);

  // Fetch offers on component mount
  useEffect(() => {
    dispatch(fetchPreviousOffers());
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

  // Helper function to format offer data
  const formatOfferData = (offer) => {
    const vehicleName = `${offer.year} ${offer.make} ${offer.model}${offer.trim && offer.trim !== 'N/A' ? ` ${offer.trim}` : ''}`;
    const offerAmount = parseFloat(offer.cash_offer) || 0;
    const expiredDate = new Date(offer.expired_at);
    const isExpired = expiredDate < new Date();
    
    return {
      id: offer.product_id,
      vehicle: vehicleName,
      offerAmount,
      status: isExpired ? 'expired' : 'active',
      reason: isExpired ? 'Offer expired' : 'Offer active',
      date: expiredDate,
      auctionId: offer.product_id,
      vin: offer.vin,
      imageUrl: offer.image_url,
      title: offer.title
    };
  };

  // Sort options
  const sortOptions = [
    { value: 'date-desc', label: 'Newest First', icon: ArrowDown, description: 'Most recent offers' },
    { value: 'date-asc', label: 'Oldest First', icon: ArrowUp, description: 'Earliest offers' },
    { value: 'amount-desc', label: 'Highest Amount', icon: ArrowDown, description: 'Highest to lowest' },
    { value: 'amount-asc', label: 'Lowest Amount', icon: ArrowUp, description: 'Lowest to highest' },
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

  // Sort offers based on selected options
  const sortedOffers = useMemo(() => {
    if (!offers || offers.length === 0) return [];

    // Sort the offers
    return [...offers].sort((a, b) => {
      const offerA = formatOfferData(a);
      const offerB = formatOfferData(b);

      switch (sortBy) {
        case 'date-desc':
          return offerB.date - offerA.date;
        case 'date-asc':
          return offerA.date - offerB.date;
        case 'amount-desc':
          return offerB.offerAmount - offerA.offerAmount;
        case 'amount-asc':
          return offerA.offerAmount - offerB.offerAmount;
        default:
          return 0;
      }
    });
  }, [offers, sortBy]);

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

  return (
    <div className="min-h-screen bg-gradient-hero p-8">
      <div className="max-w-8xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1 variants={itemVariants} className="text-3xl font-bold text-neutral-800 mb-2">
                Previous Offers
              </motion.h1>
              <motion.p variants={itemVariants} className="text-neutral-600">
                Review your past offers and auction results. {totalCount > 0 && `(${totalCount} total offers)`}
              </motion.p>
            </div>
            <div className="mb-8 flex items-center justify-end">
          {/* Modern Sort Dropdown */}
          {!loading && !error && offers.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="relative w-[200px] left-6"
                ref={dropdownRef}
              >
                {/* Dropdown Trigger */}
                <button
                  onClick={() => !isSorting && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isSorting}
                  className={`flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent group ${
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
                      className="absolute top-full left-0 right-6 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      {sortOptions.map((option, index) => {
                        const IconComponent = option.icon;
                        const isSelected = option.value === sortBy;
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSortSelect(option.value)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors duration-150 ${
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
            )}
        </div>
            
          </div>
        </motion.div>

      <motion.div>

        
      </motion.div>
        

        {/* Loading State */}
        {loading && <PreviousOffersSkeleton />}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Offers</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Offers State */}
        {!loading && !error && (!hasOffers || offers.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Car className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Previous Offers</h3>
            <p className="text-neutral-500">You don't have any previous offers yet.</p>
          </motion.div>
        )}


        {/* Offers List or Sorting Loading */}
        {!loading && !error && sortedOffers.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Sorting Loading State - Show skeleton for offers list */}
            {isSorting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <OffersListSkeleton />
              </motion.div>
            )}

            {/* Offers List - Hidden during sorting */}
            {!isSorting && (
              <>
                {sortedOffers.map((offer, index) => {
              const formattedOffer = formatOfferData(offer);
              return (
                <motion.div
                  key={formattedOffer.id}
                  variants={itemVariants}
                  className="card p-6 hover:shadow-medium transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {formattedOffer.imageUrl ? (
                          <img 
                            src={formattedOffer.imageUrl} 
                            alt={formattedOffer.vehicle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Car className="w-8 h-8 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800">{formattedOffer.vehicle}</h3>
                        <p className="text-sm text-neutral-600">
                          {formatDate(formattedOffer.date)} • VIN: {formattedOffer.vin}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">{formattedOffer.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-800 mb-1">
                        {formatCurrency(formattedOffer.offerAmount)}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        formattedOffer.status === 'expired' 
                          ? 'bg-warning/10 text-warning' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {formattedOffer.status === 'expired' ? 'Expired' : 'Active'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600 mb-2">
                          <strong>Status:</strong> {formattedOffer.reason}
                        </p>
                        <div className="flex space-x-2">
                          <button className="btn-ghost flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          <button className="btn-secondary flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4" />
                            <span>Relist Vehicle</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Bids Button - Bottom Right */}
                      <div className="ml-4">
                        {
                          offer.bid && offer.bid.length == 0 ? <p className="text-sm text-neutral-600">No bids</p> :<button 
                          onClick={() => handleShowBids(offer)}
                          className="cursor-pointer group relative  hover:from-orange-600 hover:to-orange-700 text-[#f6851f] border-2 border-[#f6851f] px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                        >
                          <DollarSign className="w-4 h-4 group-hover:animate-pulse" />
                          <span>
                            {offer.bid && offer.bid.length > 0 
                              ? `View Bids` 
                              : 'View Bids'
                            }
                          </span>
                          {offer.bid && offer.bid.length > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                              {offer.bid.length}
                            </div>
                          )}
                        </button>
                        }
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
              </>
            )}
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
                     Bids for {selectedOffer.year} {selectedOffer.make} {selectedOffer.model}
                   </h2>
                   <p className="text-sm text-neutral-600 mt-1">
                     VIN: {selectedOffer.vin} • {selectedOffer.bid?.length || 0} bids
                   </p>
                 </div>
                 <button
                   onClick={handleCloseBidsModal}
                   className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                 >
                   <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

               {/* Modal Content */}
               <div className="p-6 overflow-y-auto max-h-[60vh]">
                 {selectedOffer.bid && selectedOffer.bid.length > 0 ? (
                   <div className="space-y-4">
                     {selectedOffer.bid.map((bid, index) => (
                       <motion.div
                         key={bid.id}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: index * 0.1 }}
                         className="bg-neutral-50 rounded-xl p-4 border border-neutral-200"
                       >
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                               <span className="text-orange-600 font-semibold text-sm">
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
                             <div className="text-2xl font-bold text-orange-600">
                               ${parseFloat(bid.amount).toLocaleString()}
                             </div>
                             <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                               bid.status === 'rejected' 
                                 ? 'bg-red-100 text-red-700'
                                 : bid.status === 'expired'
                                 ? 'bg-yellow-100 text-yellow-700'
                                 : 'bg-green-100 text-green-700'
                             }`}>
                               {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
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
                           <div>
                             <span className="text-neutral-500">Bidder ID:</span>
                             <p className="font-medium text-neutral-800">#{bid.bidder_id}</p>
                           </div>
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
                     <p className="text-neutral-500">You don't have any bids to this auction.</p>
                   </div>
                 )}
               </div>

               {/* Modal Footer */}
               <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
                 <button
                   onClick={handleCloseBidsModal}
                   className="cursor-pointer px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
 
 export default PreviousOffersPage;
