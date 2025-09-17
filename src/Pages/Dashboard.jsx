import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Car, DollarSign, Calendar, TrendingUp, Clock, Users, Bell, ArrowRight, Eye, CheckCircle, Gavel, Car as CarIcon, Calendar as CalendarIcon, DollarSign as DollarIcon } from 'lucide-react';
import CountUp from 'react-countup';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  fetchLiveAuctions, 
  fetchAcceptedOffers, 
  fetchAppointments,
  fetchDashboardSummary,
  selectLiveAuctions, 
  selectAcceptedOffers, 
  selectAppointments,
  selectDashboardSummary,
  selectOffersLoading, 
  selectOffersError 
} from '../redux/slices/offersSlice';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

const Dashboard = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const liveAuctions = useSelector(selectLiveAuctions);
  const acceptedOffers = useSelector(selectAcceptedOffers);
  const appointments = useSelector(selectAppointments);
  const dashboardSummary = useSelector(selectDashboardSummary);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);

  // Calculate stats from dashboard summary data
  const stats = {
    acceptedOffers: dashboardSummary?.accepted_offers || 0,
    activeAuctions: dashboardSummary?.active_auctions || 0,
    totalVehicles: dashboardSummary?.total_vehicles || 0,
    upcomingAppointments: dashboardSummary?.upcoming_appointments || 0,
    totalBidValue: dashboardSummary?.total_bid_value || 0,
  };

  // Get recent activity from dashboard summary
  const recentActivity = dashboardSummary?.recent_activity || [];

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchLiveAuctions());
    dispatch(fetchAcceptedOffers());
    dispatch(fetchAppointments());
  }, [dispatch]);


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

  const actionVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  // Show loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero p-8">
        <div className="max-w-8xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button 
              onClick={() => {
                dispatch(fetchDashboardSummary());
                dispatch(fetchLiveAuctions());
                dispatch(fetchAcceptedOffers());
                dispatch(fetchAppointments());
              }}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-16 min-h-screen bg-gradient-hero p-8">
        <div className="max-w-8xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-neutral-800 mb-2">
              Welcome back, John!
            </motion.h1>
            <motion.p variants={itemVariants} className="text-neutral-600">
              Here's what's happening with your auctions today.
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          >
            {/* Accepted Offers */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-800">
                    <CountUp end={stats.acceptedOffers} duration={1} />
                  </div>
                  <div className="text-sm text-neutral-600">Accepted Offers</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Offers accepted</span>
              </div>
            </motion.div>

            {/* Active Auctions */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-800">
                    <CountUp end={stats.activeAuctions} duration={1} />
                  </div>
                  <div className="text-sm text-neutral-600">Active Auctions</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-orange-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Currently live</span>
              </div>
            </motion.div>

            {/* Total Vehicles */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-800">
                    <CountUp end={stats.totalVehicles} duration={1} />
                  </div>
                  <div className="text-sm text-neutral-600">Total Vehicles</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <Car className="w-4 h-4 mr-1" />
                <span>In your fleet</span>
              </div>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-800">
                    <CountUp end={stats.upcomingAppointments} duration={1} />
                  </div>
                  <div className="text-sm text-neutral-600">Upcoming Appointments</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-purple-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Scheduled meetings</span>
              </div>
            </motion.div>

            {/* Total Bid Value */}
            <motion.div variants={itemVariants} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-800">
                    <CountUp end={stats.totalBidValue} duration={1} prefix="$" separator="," />
                  </div>
                  <div className="text-sm text-neutral-600">Total Bid Value</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>All time bids</span>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Auctions */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2"
            >
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-800">Live Auctions</h2>
                  <button className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium flex items-center">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="space-y-4">
                  {liveAuctions && liveAuctions.length > 0 ? (
                    liveAuctions.slice(0, 3).map((auction) => (
                      <motion.div
                        key={auction.id}
                        className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {auction.image_url ? (
                            <img 
                              src={auction.image_url} 
                              alt={auction.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Car className="w-8 h-8 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-800">{auction.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600">
                            <span>Current Bid: <span className="font-semibold text-success">{formatCurrency(parseFloat(auction.current_bid) || 0)}</span></span>
                            <span>•</span>
                            <span>{auction.bid_count || 0} bids</span>
                            <span>•</span>
                            <span className="text-warning">{auction.time_remaining || 'Live'}</span>
                          </div>
                        </div>
                        <button className="btn-ghost p-2 cursor-pointer">
                          <Eye className="w-4 h-4 " />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Car className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-500">No live auctions at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-800">Recent Activity</h2>
                  <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'bid' ? 'bg-emerald-500' :
                          activity.type === 'auction' ? 'bg-orange-500' :
                          activity.type === 'appointment' ? 'bg-purple-500' :
                          'bg-neutral-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-800">{activity.message}</p>
                          <p className="text-xs text-neutral-500">
                            {activity.formatted_date?.date} at {activity.formatted_date?.time}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-500">No recent activity</p>
                    </div>
                  )}
                </div>

                {/* <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All Activity
                </button> */}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="mt-8"
          >
            <div className="card p-8 bg-white rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-800 mb-6 tracking-tight">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  variants={actionVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 cursor-pointer transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-800">New Auction</span>
                </motion.div>
                <motion.div
                  variants={actionVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 cursor-pointer transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-800">Book Appointment</span>
                </motion.div>
                <motion.div
                  variants={actionVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 cursor-pointer transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-800">All Auctions</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;