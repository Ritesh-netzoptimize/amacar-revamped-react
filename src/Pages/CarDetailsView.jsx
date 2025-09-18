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
  Mail
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import api from '../lib/api';

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
    <div className="min-h-screen bg-gradient-hero p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
              {basic_info?.title || 'Vehicle Details'}
            </h1>
            <p className="text-neutral-600">
              Complete vehicle information and auction details
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Year</label>
                    <p className="text-neutral-800">{basic_info?.year || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Make</label>
                    <p className="text-neutral-800">{basic_info?.make || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Model</label>
                    <p className="text-neutral-800">{basic_info?.model || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Trim</label>
                    <p className="text-neutral-800">{basic_info?.trim || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">VIN</label>
                  <p className="text-neutral-800 font-mono text-sm">{basic_info?.vin || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Mileage</label>
                    <p className="text-neutral-800">{basic_info?.mileage ? `${basic_info.mileage.toLocaleString()} miles` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Body Type</label>
                    <p className="text-neutral-800">{basic_info?.body_type || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Exterior Color</label>
                    <p className="text-neutral-800">{basic_info?.exterior_color || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Interior Color</label>
                    <p className="text-neutral-800">{basic_info?.interior_color || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Transmission</label>
                    <p className="text-neutral-800">{basic_info?.transmission || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Engine Type</label>
                    <p className="text-neutral-800">{basic_info?.engine_type || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Powertrain</label>
                  <p className="text-neutral-800">{basic_info?.powertrain_description || 'N/A'}</p>
                </div>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800">Location</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Address</label>
                  <p className="text-neutral-800">
                    {location?.city && location?.state 
                      ? `${location.city}, ${location.state}` 
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-neutral-600">ZIP Code</label>
                  <p className="text-neutral-800">{location?.zip_code || 'N/A'}</p>
                </div>

                {location?.coordinates && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Latitude</label>
                      <p className="text-neutral-800 font-mono text-sm">{location.coordinates.lat}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Longitude</label>
                      <p className="text-neutral-800 font-mono text-sm">{location.coordinates.lon}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Cash Offer */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800">Cash Offer</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Offer Amount</label>
                  <p className="text-2xl font-bold text-orange-600">
                    {cash_offer?.offer_amount ? formatCurrency(cash_offer.offer_amount) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-neutral-600">Offer Date</label>
                  <p className="text-neutral-800">
                    {cash_offer?.offer_date ? formatDate(cash_offer.offer_date) : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Expiration</label>
                  <p className="text-neutral-800">{cash_offer?.offer_expiration || 'N/A'}</p>
                </div>
              </div>
            </motion.div>

            {/* Auction Information */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800">Auction Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Status</label>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      auction?.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {auction?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Auction Started</label>
                  <p className="text-neutral-800">
                    {auction?.auction_started_at ? formatDate(auction.auction_started_at) : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Auction Ends</label>
                  <p className="text-neutral-800">
                    {auction?.auction_ends_at ? formatDate(auction.auction_ends_at) : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Time Remaining</label>
                  <p className="text-neutral-800 font-mono">
                    {formatRemainingTime(auction?.remaining_seconds)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600">Working Hours</label>
                  <p className="text-neutral-800">
                    {auction?.in_working_hours ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* User Information */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800">Seller Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Name</label>
                  <p className="text-neutral-800">{user?.display_name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-neutral-600">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <p className="text-neutral-800">{user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">First Name</label>
                    <p className="text-neutral-800">{user?.first_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Last Name</label>
                    <p className="text-neutral-800">{user?.last_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Condition Assessment */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800">Condition Assessment</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Cosmetic Condition</label>
                  <p className="text-neutral-800">{condition_assessment?.cosmetic_condition || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-neutral-600">Smoked Windows</label>
                  <p className="text-neutral-800">{condition_assessment?.smoked_windows || 'N/A'}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bids Table */}
          {bids && bids.length > 0 && (
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800">Bids ({bids.length})</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Bidder</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Date & Time</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr key={bid.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(bid.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-neutral-800">{bid.bidder_display_name}</p>
                            <p className="text-sm text-neutral-600">{bid.bidder_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getBidStatusIcon(bid.status)}
                            <span className="text-sm">{getBidStatusText(bid.status)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-neutral-800">{bid.bid_at?.date}</p>
                            <p className="text-sm text-neutral-600">{bid.bid_at?.time}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-neutral-600">{bid.notes || 'N/A'}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Images Section */}
          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-pink-600" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-800">Images</h2>
            </div>
            
            {images && images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No images available</p>
                <p className="text-sm text-neutral-500 mt-2">
                  Images will be displayed here when available
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CarDetailsView;
