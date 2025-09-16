import { motion, AnimatePresence } from 'framer-motion';
import { Car, CheckCircle, Clock, FileText, Phone, MapPin, RefreshCw, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useMemo, useRef } from 'react';
import { fetchAcceptedOffers, selectAcceptedOffers, selectOffersLoading, selectOffersError } from '../redux/slices/offersSlice';
import AcceptedOffersSkeleton from '../components/skeletons/AcceptedOffersSkeleton';
import OffersListSkeleton from '../components/skeletons/OffersListSkeleton';

const AcceptedOffersPage = () => {
  const dispatch = useDispatch();
  const acceptedOffersData = useSelector(selectAcceptedOffers);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);

  // Sorting state
  const [sortBy, setSortBy] = useState('date-desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [sortProgress, setSortProgress] = useState(0);
  const dropdownRef = useRef(null);

  // Transform API data to match component structure
  const transformAcceptedOffersData = (offers) => {
    if (!offers || !Array.isArray(offers)) return [];
    
    return offers.map(offer => {
      // Find the accepted bid
      const acceptedBid = offer.bid?.find(bid => bid.is_accepted && bid.status === 'accepted') || offer.bid?.[0];
      
      // Parse accepted date safely
      let acceptedDate;
      try {
        acceptedDate = new Date(acceptedBid?.accepted_at_raw || offer.bid?.[0]?.created_at_raw || new Date());
        if (isNaN(acceptedDate.getTime())) {
          acceptedDate = new Date();
        }
      } catch (e) {
        acceptedDate = new Date();
      }

      // Determine status based on accepted date and other factors
      const now = new Date();
      const daysSinceAccepted = Math.floor((now - acceptedDate) / (1000 * 60 * 60 * 24));
      
      let status = 'accepted';
      let nextStep = 'Complete paperwork';
      let estimatedCompletion = new Date(acceptedDate.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from accepted

      if (daysSinceAccepted >= 1) {
        status = 'paperwork';
        nextStep = 'Complete paperwork';
        estimatedCompletion = new Date(acceptedDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from accepted
      }
      
      if (daysSinceAccepted >= 3) {
        status = 'pickup_scheduled';
        nextStep = 'Schedule pickup';
        estimatedCompletion = new Date(acceptedDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from accepted
      }
      
      if (daysSinceAccepted >= 7) {
        status = 'completed';
        nextStep = 'Transaction completed';
        estimatedCompletion = new Date(acceptedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      return {
        id: offer.product_id?.toString() || 'unknown',
        vehicle: `${offer.year || 'N/A'} ${offer.make || 'Unknown'} ${offer.model || 'Vehicle'}`,
        year: parseInt(offer.year) || 0,
        make: offer.make || 'Unknown',
        model: offer.model || 'Unknown',
        trim: offer.trim || 'N/A',
        vin: offer.vin || 'N/A',
        offerAmount: parseFloat(acceptedBid?.amount || offer.cash_offer || '0'),
        status: status,
        dealer: acceptedBid?.bidder_display_name || 'Unknown Dealer',
        dealerEmail: acceptedBid?.bidder_email || '',
        dealerId: acceptedBid?.bidder_id || '',
        dealerPhone: 'Contact via email', // Not provided in API
        dealerAddress: 'Address not provided', // Not provided in API
        acceptedDate: acceptedDate,
        nextStep: nextStep,
        estimatedCompletion: estimatedCompletion,
        imageUrl: offer.image_url || '',
        title: offer.title || '',
        appointmentUrl: offer.appointment_url || '',
        acceptedBidData: acceptedBid,
        cashOffer: parseFloat(offer.cash_offer || '0')
      };
    });
  };

  const acceptedOffers = transformAcceptedOffersData(acceptedOffersData);

  useEffect(() => {
    dispatch(fetchAcceptedOffers());
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

  // Sort offers based on selected options
  const sortedOffers = useMemo(() => {
    if (!acceptedOffers || acceptedOffers.length === 0) return [];

    // Sort the offers
    return [...acceptedOffers].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.acceptedDate - a.acceptedDate;
        case 'date-asc':
          return a.acceptedDate - b.acceptedDate;
        case 'amount-desc':
          return b.offerAmount - a.offerAmount;
        case 'amount-asc':
          return a.offerAmount - b.offerAmount;
        default:
          return 0;
      }
    });
  }, [acceptedOffers, sortBy]);

  const statusSteps = [
    { key: 'accepted', label: 'Offer Accepted', icon: CheckCircle },
    { key: 'paperwork', label: 'Paperwork', icon: FileText },
    { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Clock },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

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

  // Loading state
  if (loading) {
    return <AcceptedOffersSkeleton />;
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
                onClick={() => dispatch(fetchAcceptedOffers())}
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
          <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1 variants={itemVariants} className="text-3xl font-bold text-neutral-800 mb-2">
                Accepted Offers
              </motion.h1>
              <motion.p variants={itemVariants} className="text-neutral-600">
                Track the progress of your accepted offers through to completion.
              </motion.p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                variants={itemVariants}
                onClick={() => dispatch(fetchAcceptedOffers())}
                disabled={loading}
                className="btn-ghost flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
              
              {/* Modern Sort Dropdown */}
              {!loading && !error && acceptedOffers.length > 0 && (
                <motion.div
                  variants={itemVariants}
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
              )}
            </div>
          </div>
        </motion.div>

        {/* No Offers State */}
        {!loading && !error && acceptedOffers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Accepted Offers</h3>
            <p className="text-neutral-600 mb-6">You don't have any accepted offers at the moment.</p>
            <button className="btn-primary">
              View Pending Offers
            </button>
          </motion.div>
        )}

        {/* Offers List or Sorting Loading */}
        {!loading && !error && sortedOffers.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
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
                {sortedOffers.map((offer) => (
            <motion.div
              key={offer.id}
              variants={itemVariants}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {offer.imageUrl ? (
                      <img 
                        src={offer.imageUrl} 
                        alt={offer.vehicle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Car className="w-8 h-8 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800">{offer.vehicle}</h3>
                    <p className="text-neutral-600">
                      Accepted on {formatDate(offer.acceptedDate)}
                    </p>
                    <p className="text-sm text-neutral-500">
                      VIN: {offer.vin} • {offer.title}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-success mb-1">
                    {formatCurrency(offer.offerAmount)}
                  </div>
                  <div className="text-sm text-neutral-600">
                    by {offer.dealer}
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="relative flex items-center justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.key === offer.status;
                    const isCompleted = statusSteps.findIndex(s => s.key === offer.status) > index;

                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          isCompleted 
                            ? 'bg-success text-white' 
                            : isActive 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-neutral-200 text-neutral-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-medium text-center ${
                          isActive ? 'text-primary-600' : 'text-neutral-500'
                        }`}>
                          {step.label}
                        </span>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`absolute top-5 h-0.5 ${
                              isCompleted ? 'bg-success' : 'bg-neutral-200'
                            }`}
                            style={{
                              width: 'calc(100% - 40px)',
                              left: 'calc(50% + 20px)',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dealer Information */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-neutral-800 mb-3">Dealer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm text-neutral-700">{offer.dealer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm text-neutral-700">{offer.dealerPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neutral-500">Email:</span>
                    <span className="text-sm text-neutral-700">{offer.dealerEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neutral-500">Dealer ID:</span>
                    <span className="text-sm text-neutral-700">#{offer.dealerId}</span>
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm text-neutral-700">{offer.dealerAddress}</span>
                  </div>
                  {offer.cashOffer > 0 && (
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <span className="text-sm text-neutral-500">Cash Offer:</span>
                      <span className="text-sm font-medium text-success">{formatCurrency(offer.cashOffer)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-800">Next Step</p>
                  <p className="text-sm text-neutral-600">{offer.nextStep}</p>
                  <p className="text-xs text-neutral-500">
                    Estimated completion: {formatDate(offer.estimatedCompletion)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="cursor-pointer btn-ghost flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Contact Dealer</span>
                  </button>
                  {offer.appointmentUrl && (
                    <a
                      href={offer.appointmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Schedule Appointment</span>
                    </a>
                  )}
                  <button className="btn-primary">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AcceptedOffersPage;