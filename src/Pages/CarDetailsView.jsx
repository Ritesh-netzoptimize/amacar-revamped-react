import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Car, 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  Calendar, 
  Gavel, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Star,
  Award,
  Shield
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import api from '../lib/api';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '../components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";

const CarDetailsView = () => {
  const { state } = useLocation();
  const productId = state?.productId;
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!productId) {
        setError('No product ID available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("productId", productId);
        console.log("before api call")
        const response = await api.get(`/vehicle/details/${productId}`);
        
        if (response.data.success) {
          setVehicleData(response.data.vehicle);
          console.log("response.data.vehicle", response.data.vehicle);
          console.log("vehicleData", vehicleData);
        } else {
          setError(response.data.message || 'Failed to fetch vehicle details');
        }
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [productId]);

  // Format remaining time
  const formatRemainingTime = (seconds) => {
    if (!seconds) return 'N/A';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format bid status
  const getBidStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format bid status text
  const getBidStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  // Container variants for animations
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
    return (
      <div className="min-h-screen bg-gradient-hero p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">Error Loading Vehicle Details</h3>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!vehicleData) {
    return (
      <div className="min-h-screen bg-gradient-hero p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Vehicle Data</h3>
            <p className="text-neutral-600">No vehicle details available for this product.</p>
          </div>
        </div>
      </div>
    );
  }

  const { basic_info, location, cash_offer, auction, user, condition_assessment, bids, images } = vehicleData;

  return (
    <div className="mt-16 min-h-screen bg-gradient-hero">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="px-8 pt-8">
            <h1 className="text-4xl font-bold text-neutral-800 mb-2">
              {basic_info?.title || 'Vehicle Details'}
            </h1>
            <p className="text-neutral-600 text-lg">
              Complete vehicle information and auction details
            </p>
          </motion.div>

          {/* Images Carousel and Key Info Section */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Images Carousel - Takes 2 columns */}
               {images && images.length > 0 ? (
                 <motion.div variants={itemVariants} className="lg:col-span-2">
                   <Carousel 
                     className="w-full"
                     opts={{
                       align: "start",
                       loop: true,
                     }}
                     plugins={[
                       Autoplay({
                         delay: 3000,
                         stopOnInteraction: false,
                         stopOnMouseEnter: true,
                       }),
                     ]}
                   >
                     <CarouselContent>
                       {images.map((image, index) => (
                         <CarouselItem key={image.attachment_id || index}>
                           <div className="aspect-[4/3] w-full rounded-xl overflow-hidden shadow-sm">
                             <img 
                               src={image.url} 
                               alt={image.name || `Vehicle image ${index + 1}`}
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                                 e.target.nextSibling.style.display = 'flex';
                               }}
                             />
                             <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center" style={{display: 'none'}}>
                               <ImageIcon className="w-16 h-16 text-neutral-400" />
                             </div>
                           </div>
                         </CarouselItem>
                       ))}
                     </CarouselContent>
                     <CarouselPrevious className="left-2 bg-white/90 hover:bg-white shadow-lg border-0 cursor-pointer" />
                     <CarouselNext className="right-2 bg-white/90 hover:bg-white shadow-lg border-0 cursor-pointer" />
                   </Carousel>
                 </motion.div>
               ) : (
                 <motion.div variants={itemVariants} className="lg:col-span-2">
                   <div className="aspect-[4/3] w-full bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center shadow-sm">
                     <div className="text-center">
                       <ImageIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                       <p className="text-neutral-600">No images available</p>
                     </div>
                   </div>
                 </motion.div>
               )}

              {/* Auction Details and Cash Offer - Takes 1 column */}
              <div className="space-y-6">
                {/* Auction Information */}
                <motion.div variants={itemVariants} className="card h-[50%] p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Gavel className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-800">Auction Details</h2>
                      <p className="text-sm text-neutral-600">Status and timing</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 h-fit">
                    <div className=" bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        auction?.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {auction?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Started</p>
                      <p className="text-xs font-semibold text-neutral-800">
                        {auction?.auction_started_at ? formatDate(auction.auction_started_at) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Ends</p>
                      <p className="text-xs font-semibold text-neutral-800">
                        {auction?.auction_ends_at ? formatDate(auction.auction_ends_at) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Time Left</p>
                      <p className="text-xs font-semibold text-neutral-800 font-mono">
                        {formatRemainingTime(auction?.remaining_seconds)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Cash Offer - Highlighted */}
                <motion.div variants={itemVariants} className="h- card p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-800">Cash Offer</h2>
                      <p className="text-sm text-neutral-600">Current offer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs font-medium text-neutral-600 mb-1">Offer Amount</p>
                      <p className="text-xl font-bold text-orange-600">
                        {cash_offer?.offer_amount ? formatCurrency(cash_offer.offer_amount) : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs font-medium text-neutral-600 mb-1">Date</p>
                        <p className="text-sm font-semibold text-neutral-800">
                          {cash_offer?.offer_date ? formatDate(cash_offer.offer_date) : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs font-medium text-neutral-600 mb-1">Expires</p>
                        <p className="text-sm font-semibold text-neutral-800">{cash_offer?.offer_expiration || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Overview - Most Important Info */}
            <motion.div variants={itemVariants} className="lg:col-span-2 card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">Vehicle Overview</h2>
                  <p className="text-neutral-600">Key details about this vehicle</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Vehicle Details</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Year/Make/Model:</span>
                        <span className="font-semibold text-neutral-800">
                          {basic_info?.year} {basic_info?.make} {basic_info?.model}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Trim:</span>
                        <span className="font-semibold text-neutral-800">{basic_info?.trim || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Mileage:</span>
                        <span className="font-semibold text-neutral-800">
                          {basic_info?.mileage ? `${basic_info.mileage.toLocaleString()} miles` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Condition</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Body Type:</span>
                        <span className="font-semibold text-neutral-800">{basic_info?.body_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Exterior:</span>
                        <span className="font-semibold text-neutral-800">{basic_info?.exterior_color || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Interior:</span>
                        <span className="font-semibold text-neutral-800">{basic_info?.interior_color || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">Performance</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Transmission:</span>
                        <span className="font-semibold text-neutral-800">{basic_info?.transmission || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Engine:</span>
                        <span className="font-semibold text-neutral-800">{basic_info?.engine_type || 'N/A'}</span>
                      </div>
                      {basic_info?.powertrain_description && (
                        <div className="mt-3">
                          <span className="text-sm text-neutral-600">Powertrain:</span>
                          <p className="text-sm font-medium text-neutral-800 mt-1">{basic_info.powertrain_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Location & Seller Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Location */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">Location</h3>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">City, State:</span>
                      <span className="font-semibold text-neutral-800">
                        {location?.city && location?.state 
                          ? `${location.city}, ${location.state}` 
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">ZIP Code:</span>
                      <span className="font-semibold text-neutral-800">{location?.zip_code || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">Seller</h3>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Name:</span>
                      <span className="font-semibold text-neutral-800">{user?.display_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Email:</span>
                      <span className="font-semibold text-neutral-800 text-sm">{user?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>


            {/* Condition Assessment */}
            {condition_assessment && (
              <motion.div variants={itemVariants} className="lg:col-span-3 card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Condition Assessment</h2>
                    <p className="text-neutral-600">Vehicle condition details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-neutral-600 mb-2">Cosmetic Condition</p>
                    <p className="text-lg font-semibold text-neutral-800">{condition_assessment?.cosmetic_condition || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-100 p-4 rounded-lg">
                    <p className="text-sm font-medium text-neutral-600 mb-2">Smoked Windows</p>
                    <p className="text-lg font-semibold text-neutral-800">{condition_assessment?.smoked_windows || 'N/A'}</p>
                  </div>
                </div>
              </motion.div>
            )}
            </div>
          </div>

          {/* Bids Table */}
          {bids && bids.length > 0 && (
            <motion.div variants={itemVariants} className="px-8 pb-8">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Gavel className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Bids ({bids.length})</h2>
                    <p className="text-neutral-600">Current bids on this vehicle</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Amount</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Bidder</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Status</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Date & Time</th>
                        <th className="text-left py-4 px-4 font-semibold text-neutral-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bids.map((bid) => (
                        <tr key={bid.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(bid.amount)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-neutral-800">{bid.bidder_display_name}</p>
                              <p className="text-sm text-neutral-600">{bid.bidder_email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {getBidStatusIcon(bid.status)}
                              <span className="font-medium">{getBidStatusText(bid.status)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-neutral-800">{bid.bid_at?.date}</p>
                              <p className="text-sm text-neutral-600">{bid.bid_at?.time}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-neutral-600">{bid.notes || 'N/A'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CarDetailsView;
