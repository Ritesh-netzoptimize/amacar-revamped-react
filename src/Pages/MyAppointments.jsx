import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, formatTimeRemaining } from '../lib/utils';
import { fetchAppointments, selectAppointments, selectOffersLoading, selectOffersError } from '../redux/slices/offersSlice';
import MyAppointmentsSkeleton from '../components/skeletons/MyAppointmentsSkeleton';

const MyAppointments = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Redux state
  const appointments = useSelector(selectAppointments);
  const loading = useSelector(selectOffersLoading);
  const error = useSelector(selectOffersError);

  // Fetch appointments on component mount
  useEffect(() => {
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

        {/* Today's Appointments */}
        {getTodaysAppointments().length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">Today's Appointments</h2>
            <div className="space-y-4">
              {getTodaysAppointments().map((appointment) => (
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
                      <button className="btn-ghost flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </button>
                      <button className="btn-primary flex items-center space-x-2">
                        <Video className="w-4 h-4" />
                        <span>Join</span>
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
            {getUpcomingAppointments().map((appointment) => (
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
                    <button className="btn-ghost flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => window.open(appointment.reschedule_url, '_blank')}
                    >
                      Reschedule
                    </button>
                    <button className="btn-primary">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Empty State */}
        {appointments.length === 0 && (
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
    </div>
  );
};

export default MyAppointments;
