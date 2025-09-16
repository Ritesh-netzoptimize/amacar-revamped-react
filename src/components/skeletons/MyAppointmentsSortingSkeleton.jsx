import { motion } from 'framer-motion';

const MyAppointmentsSortingSkeleton = () => {
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Today's Appointments Section Skeleton */}
      <motion.div variants={itemVariants}>
        <div className="h-6 bg-neutral-200 rounded-md w-48 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 1 }).map((_, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card p-6 border-l-4 border-primary-500 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Calendar Icon Skeleton */}
                  <div className="w-12 h-12 bg-primary-100 rounded-lg animate-pulse"></div>
                  <div>
                    {/* Appointment Title Skeleton */}
                    <div className="h-6 bg-neutral-200 rounded-md w-64 mb-2 animate-pulse"></div>
                    {/* Dealer Email Skeleton */}
                    <div className="h-4 bg-neutral-200 rounded-md w-48 mb-2 animate-pulse"></div>
                    <div className="flex items-center space-x-4">
                      {/* Time Skeleton */}
                      <div className="h-4 bg-neutral-200 rounded-md w-32 animate-pulse"></div>
                      {/* Status Badge Skeleton */}
                      <div className="h-6 bg-neutral-200 rounded-full w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {/* Call Button Skeleton */}
                  <div className="h-10 bg-neutral-200 rounded-lg w-20 animate-pulse"></div>
                  {/* Join Button Skeleton */}
                  <div className="h-10 bg-neutral-200 rounded-lg w-20 animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Appointments Section Skeleton */}
      <motion.div variants={itemVariants}>
        <div className="h-6 bg-neutral-200 rounded-md w-56 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card p-6 hover:shadow-medium transition-all duration-300 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Calendar Icon Skeleton */}
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg animate-pulse"></div>
                  <div>
                    {/* Appointment Title Skeleton */}
                    <div className="h-6 bg-neutral-200 rounded-md w-64 mb-2 animate-pulse"></div>
                    {/* Dealer Email Skeleton */}
                    <div className="h-4 bg-neutral-200 rounded-md w-48 mb-2 animate-pulse"></div>
                    <div className="flex items-center space-x-4">
                      {/* Date and Time Skeleton */}
                      <div className="h-4 bg-neutral-200 rounded-md w-40 animate-pulse"></div>
                      {/* Status Badge Skeleton */}
                      <div className="h-6 bg-neutral-200 rounded-full w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {/* Call Button Skeleton */}
                  <div className="h-10 bg-neutral-200 rounded-lg w-20 animate-pulse"></div>
                  {/* Reschedule Button Skeleton */}
                  <div className="h-10 bg-neutral-200 rounded-lg w-28 animate-pulse"></div>
                  {/* View Details Button Skeleton */}
                  <div className="h-10 bg-neutral-200 rounded-lg w-32 animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyAppointmentsSortingSkeleton;
