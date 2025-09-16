import { motion } from 'framer-motion';
import { Car, CheckCircle, Clock, FileText, Phone, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchAcceptedOffers, selectAcceptedOffers, selectOffersLoading, selectOffersError } from '../redux/slices/offersSlice';
import AcceptedOffersSkeleton from '../components/skeletons/AcceptedOffersSkeleton';

const AcceptedOffersPage = () => {
  const dispatch = useDispatch();
  const acceptedOffersData = useSelector(selectAcceptedOffers);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);

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
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 variants={itemVariants} className="text-3xl font-bold text-neutral-800 mb-2">
                Accepted Offers
              </motion.h1>
              <motion.p variants={itemVariants} className="text-neutral-600">
                Track the progress of your accepted offers through to completion.
              </motion.p>
            </div>
            <motion.button
              variants={itemVariants}
              onClick={() => dispatch(fetchAcceptedOffers())}
              disabled={loading}
              className="btn-ghost flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {acceptedOffers.map((offer) => (
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
        </motion.div>
      </div>
    </div>
  );
};

export default AcceptedOffersPage;