import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Video, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, RefreshCw } from 'lucide-react';
import { formatDate, formatTimeRemaining } from '../lib/utils';
import { fetchAppointments, selectAppointments, selectOffersLoading, selectOffersError } from '../redux/slices/offersSlice';
import MyAppointmentsSkeleton from '../components/skeletons/MyAppointmentsSkeleton';
import MyAppointmentsSortingSkeleton from '../components/skeletons/MyAppointmentsSortingSkeleton';
import LoadMore from '../components/ui/load-more';
import useLoadMore from '../hooks/useLoadMore';
import AppointmentDetailsModal from '../components/ui/AppointmentDetailsModal';

const MyAppointments = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Sorting state
  const [sortBy, setSortBy] = useState('date-asc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [sortProgress, setSortProgress] = useState(0);
  const dropdownRef = useRef(null);

  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState('');

  // Load more configuration
  const itemsPerPage = 1;

  // Redux state
  const appointments = useSelector(selectAppointments);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);

  // Fetch appointments on component mount
  useEffect(() => {
    dispatch(fetchAppointments());
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

  const getUpcomingAppointments = () => {
    return appointments.filter(apt => new Date(apt.start_time) > new Date());
  };

  const getTodaysAppointments = () => {
    const today = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.start_time);
      return appointmentDate.toDateString() === today.toDateString();
    });
  };

  // Sort options
  const sortOptions = [
    { value: 'date-asc', label: 'Earliest First', icon: ArrowUp, description: 'Earliest appointments' },
    { value: 'date-desc', label: 'Latest First', icon: ArrowDown, description: 'Latest appointments' },
    { value: 'dealer-asc', label: 'Dealer A-Z', icon: ArrowUp, description: 'Alphabetical by dealer' },
    { value: 'dealer-desc', label: 'Dealer Z-A', icon: ArrowDown, description: 'Reverse alphabetical' },
    { value: 'status-asc', label: 'Status A-Z', icon: ArrowUp, description: 'Alphabetical by status' },
    { value: 'status-desc', label: 'Status Z-A', icon: ArrowDown, description: 'Reverse by status' },
  ];

  // Get current selected option
  const selectedOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0];

  // Modal handlers
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedAppointment(null);
    setIsProcessing(false);
    setProcessingAction('');
  };

  const handleCall = (appointment) => {
    // Implement call functionality
    console.log('Calling dealer:', appointment.dealer_name);
    // You can integrate with a calling service here
  };

  const handleJoin = (appointment) => {
    // Implement join meeting functionality
    console.log('Joining meeting for appointment:', appointment.id);
    // You can integrate with video calling service here
  };

  const handleReschedule = async (appointment) => {
    setIsProcessing(true);
    setProcessingAction('reschedule');
    
    // Simulate API call
    setTimeout(() => {
      console.log('Rescheduling appointment:', appointment.id);
      setIsProcessing(false);
      setProcessingAction('');
      // You can implement actual reschedule logic here
    }, 2000);
  };

  const handleCancel = async (appointment, notes) => {
    setIsProcessing(true);
    setProcessingAction('cancel');
    
    // Simulate API call
    setTimeout(() => {
      console.log('Cancelling appointment:', appointment.id, 'with notes:', notes);
      setIsProcessing(false);
      setProcessingAction('');
      // You can implement actual cancel logic here
    }, 2000);
  };

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
      console.log(randomDelay)
    }, randomDelay);
  };

  // Sort appointments based on selected options
  const sortedAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];

    // Sort the appointments
    return [...appointments].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.start_time) - new Date(b.start_time);
        case 'date-desc':
          return new Date(b.start_time) - new Date(a.start_time);
        case 'dealer-asc':
          return a.dealer_name.localeCompare(b.dealer_name);
        case 'dealer-desc':
          return b.dealer_name.localeCompare(a.dealer_name);
        case 'status-asc':
          return a.formatted_status.localeCompare(b.formatted_status);
        case 'status-desc':
          return b.formatted_status.localeCompare(a.formatted_status);
        default:
          return 0;
      }
    });
  }, [appointments, sortBy]);

  // Use load more hook
  const {
    paginatedItems: paginatedAppointments,
    hasMoreItems,
    remainingItems,
    isLoadingMore,
    handleLoadMore
  } = useLoadMore(sortedAppointments, itemsPerPage);

  // Get sorted today's appointments
  const getSortedTodaysAppointments = () => {
    const today = new Date();
    return paginatedAppointments.filter(apt => {
      const appointmentDate = new Date(apt.start_time);
      return appointmentDate.toDateString() === today.toDateString();
    });
  };

  // Get sorted upcoming appointments
  const getSortedUpcomingAppointments = () => {
    console.log("paginatedAppointments", paginatedAppointments)
    return paginatedAppointments.filter(apt => new Date(apt.start_time) > new Date());
  };

  // Show loading state
  if (loading) {
    return <MyAppointmentsSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero p-8">
        <div className="max-w-8xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">Error Loading Appointments</h3>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button 
              onClick={() => dispatch(fetchAppointments())}
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
    <div className="mt-16 min-h-screen bg-gradient-hero p-8 ">
      <div className="max-w-8xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-neutral-800 mb-2">
            My Appointments
          </motion.h1>
          <motion.p variants={itemVariants} className="text-neutral-600">
            Manage your scheduled appointments with dealers.
          </motion.p>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'month' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Month View
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-neutral-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-neutral-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button className="p-2 hover:bg-neutral-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Sorting Section */}
        {!loading && !error && appointments.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-1">Appointments</h2>
                <p className="text-sm text-neutral-600">{appointments.length} scheduled appointments</p>
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

        {/* Today's Appointments or Sorting Loading */}
        {!loading && !error && appointments.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Sorting Loading State - Show skeleton for appointments */}
            {isSorting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <MyAppointmentsSortingSkeleton />
              </motion.div>
            )}

            {/* Appointments - Hidden during sorting */}
            {!isSorting && (
              <>
                {/* Today's Appointments */}
                {getSortedTodaysAppointments().length > 0 && (
                  <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4">Today's Appointments</h2>
                    <div className="space-y-4">
                      {getSortedTodaysAppointments().map((appointment) => (
                <motion.div
                  key={appointment.id}
                  className="card p-6 border-l-4 border-primary-500"
                  whileHover={{ scale: 1.02 }}  
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800">
                          Appointment with {appointment.dealer_name}
                        </h3>
                        <p className="text-sm text-neutral-600">{appointment.dealer_email}</p>
                        <div className="flex items-center space-x-4 text-sm text-neutral-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.formatted_time} ({appointment.duration} min)</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {appointment.formatted_status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(appointment)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

                {/* Upcoming Appointments */}
                <motion.div variants={itemVariants}>
                  <h2 className="text-xl font-bold text-neutral-800 mb-4">Upcoming Appointments</h2>
                  <div className="space-y-4">
                    {getSortedUpcomingAppointments().map((appointment) => (
              <motion.div
                key={appointment.id}
                className="card p-6 hover:shadow-medium transition-all duration-300"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">
                        Appointment with {appointment.dealer_name}
                      </h3>
                      <p className="text-sm text-neutral-600">{appointment.dealer_email}</p>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.formatted_date} at {appointment.formatted_time}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {appointment.formatted_status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(appointment)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Load More Component */}
        {!loading && !error && appointments.length > 0 && (
          <LoadMore
            items={sortedAppointments}
            itemsPerPage={itemsPerPage}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            hasMoreItems={hasMoreItems}
            remainingItems={remainingItems}
            SkeletonComponent={MyAppointmentsSortingSkeleton}
            buttonText="Load More Appointments"
            loadingText="Loading appointments..."
            showRemainingCount={true}
          />
        )}

        {/* Empty State */}
        {!loading && !error && appointments.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Appointments</h3>
            <p className="text-neutral-600 mb-6">You don't have any scheduled appointments at the moment.</p>
            <button className="btn-primary">
              Schedule Appointment
            </button>
          </motion.div>
        )}
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        appointment={selectedAppointment}
        onCancel={handleCancel}
        onReschedule={handleReschedule}
        onCall={handleCall}
        onJoin={handleJoin}
        isProcessing={isProcessing}
        processingAction={processingAction}
      />
    </div>
  );
};

export default MyAppointments;
